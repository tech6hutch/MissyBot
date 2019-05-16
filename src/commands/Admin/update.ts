import assert from 'assert';
import { PullResult } from 'simple-git/promise';
import { KlasaMessage, CommandStore, KlasaUser, Store, Piece } from 'klasa';
import RebootCmd from './reboot';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import { codeBlock, regExpEsc } from '../../lib/util/util';

export default class extends MissyCommand {

	baseDirRegex: RegExp | null;
	hasBaseDir: boolean;

	gitPathSeparator = '/';

	loadRegex = /\\\\?|\//g;

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Pull in new changes from GitHub.',
			permissionLevel: 10,
		});

		const trailingSlash = /[/\\]$/;
		const [cwd, userBaseDirectory] = [process.cwd(), this.client.userBaseDirectory]
			.map(path => path.replace(trailingSlash, ''));
		assert(userBaseDirectory.startsWith(cwd));
		const baseDir = regExpEsc(userBaseDirectory
			.replace(new RegExp(`^${regExpEsc(cwd)}`), '')
			.replace(/\\/g, '/')
			.replace(/^\//, ''));
		// e.g., /^src\/?/g
		this.baseDirRegex = baseDir ? new RegExp(`^${baseDir}/?`, 'g') : null;

		this.hasBaseDir = Boolean(baseDir);
	}

	get defaultLang() {
		return this.client.languages.default;
	}

	run(msg: KlasaMessage) {
		return msg.sendLoading(() => this.updateBot(msg), { loadingText: 'Pulling changes from GitHub...' });
	}

	async updateBot(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | null | never> {
		const pullResult = await this.client.git.pull();

		const { pieces, nonPieces } = this._segregateChanges(pullResult);

		const { changes, insertions, deletions } = pullResult.summary;
		await msg.send([
			`**${changes}** files changed (**${insertions}** insertions, **${deletions}** deletions).`,
			'\u200b',
			...pieces.toLoad.length ? ['Pieces to load:', codeBlock('prolog', pieces.toLoad.join('\n')), '\u200b'] : [],
			...pieces.toReload.length ? ['Pieces to reload:', codeBlock('prolog', pieces.toReload.join('\n')), '\u200b'] : [],
			...pieces.toUnload.length ? ['Pieces to unload:', codeBlock('prolog', pieces.toUnload.join('\n')), '\u200b'] : [],
			...nonPieces.length ? ['Non-piece files changed:', codeBlock('prolog', nonPieces.join('\n')), '\u200b'] : [],
		], { split: { char: '\u200b' } });

		if (nonPieces.length) {
			try {
				const qMsg = await msg.channel.ask(<KlasaUser>msg.author, 'Non-piece files changed. **Reboot the bot?**');
				// @ts-ignore using private member KlasaMessage#_responses
				msg._responses = [qMsg];
				return (<RebootCmd><MissyCommand>this.store.get('reboot')).run(msg);
			} catch (qMsg) {
				// @ts-ignore using private member KlasaMessage#_responses
				if (qMsg instanceof KlasaMessage) msg._responses = [qMsg];
				return null;
			}
		}

		if (Object.values(pieces).some(arr => !!arr.length)) {
			try {
				const qMsg = await msg.channel.ask(<KlasaUser>msg.author, '**Load piece changes?**');
				await this.handlePieceChanges(pieces);
				// @ts-ignore using private member KlasaMessage#_responses
				msg._responses = [qMsg];
				return msg.send('Done 👌🏽 (but check console for any errors)');
			} catch (qMsg) {
				// @ts-ignore using private member KlasaMessage#_responses
				if (qMsg instanceof KlasaMessage) msg._responses = [qMsg];
				return null;
			}
		}

		return msg.channel.send('No new changes.') as Promise<KlasaMessage | KlasaMessage[]>;
	}

	eatBaseDir(path: string): string {
		return this.hasBaseDir ? path.replace(this.baseDirRegex!, '') : path;
	}

	async handlePieceChanges(pieces: { toLoad: string[], toReload: string[], toUnload: string[] }) {
		for (const file of pieces.toLoad) {
			// e.g., ['commands', 'Admin', 'eval.js']
			const path = this.eatBaseDir(file).split(this.gitPathSeparator);
			try {
				await this.loadPiece(this.client.pieceStores.get(path[0]), path.slice(1).join('/'));
			} catch (e) {
				this.client.emit('wtf', e);
			}
		}

		for (const file of pieces.toReload) {
			// e.g., ['commands', 'Admin', 'eval.js']
			const path = this.eatBaseDir(file).split(this.gitPathSeparator);
			try {
				await this.reloadPiece(this._resolvePiece(path));
			} catch (_) {
				// If reloading failed, maybe it's not in the store because it was disabled?
				this.client.emit('warn', `Reloading piece at \`${file}\` failed. Attempting to load it anew...`);
				try {
					await this.loadPiece(this.client.pieceStores.get(path[0]), path.slice(1).join('/'));
				} catch (e) {
					this.client.emit('wtf', e);
				}
			}
		}

		for (const file of pieces.toUnload) {
			// e.g., ['commands', 'Admin', 'eval.js']
			const path = this.eatBaseDir(file).split(this.gitPathSeparator);
			try {
				await this.unloadPiece(this._resolvePiece(path));
			} catch (e) {
				this.client.emit('wtf', e);
			}
		}
	}

	async loadPiece(store: Store<string, Piece>, pathStr: string) {
		const path = (pathStr.endsWith('.js') ? pathStr : `${pathStr}.js`).split(this.loadRegex);
		const piece = await store.load(store.userDirectory, path);

		try {
			if (!piece) throw this.defaultLang.get('COMMAND_LOAD_FAIL');
			await piece.init();
			if (this.client.shard) {
				throw new Error("Not implemented yet");
				// await this.client.shard.broadcastEval(`
				// 	if (String(this.shard.id) !== '${this.client.shard.id}') {
				// 		const piece = this.${piece.store}.load('${piece.directory}', ${JSON.stringify(path)});
				// 		if (piece) piece.init();
				// 	}
				// `);
			}
			return true;
		} catch (error) {
			throw this.defaultLang.get('COMMAND_LOAD_ERROR', store.name, piece ? piece.name : path.join('/'), error);
		}
	}

	async reloadPiece(piece: Piece) {
		try {
			await piece.reload();
			if (this.client.shard) {
				throw new Error("Not implemented yet");
				// await this.client.shard.broadcastEval(`
				// 	if (String(this.shard.id) !== '${this.client.shard.id}') this.${piece.store}.get('${piece.name}').reload();
				// `);
			}
			return true;
		} catch (_) {
			piece.store.set(piece);
			throw this.defaultLang.get('COMMAND_RELOAD_FAILED', [piece.type, piece.name]);
		}
	}

	async unloadPiece(piece: Piece) {
		piece.unload();
		if (this.client.shard) {
			throw new Error("Not implemented yet");
			// await this.client.shard.broadcastEval(`
			// 	if (String(this.shard.id) !== '${this.client.shard.id}') this.${piece.store}.get('${piece.name}').unload();
			// `);
		}
		return true;
	}

	_segregateChanges(pullResult: PullResult) {
		const { files, created, deleted } = pullResult;

		const pieces = { toLoad: <string[]>[], toReload: <string[]>[], toUnload: <string[]>[] };
		const nonPieces = <string[]>[];
		const pieceTypes = this.client.pieceStores.keyArray();

		for (const file of files) {
			// e.g., 'commands/Admin/eval.js'
			const fileWithoutBaseDir = this.eatBaseDir(file);
			// e.g., ['commands', 'Admin', 'eval.js']
			const path = fileWithoutBaseDir.split(this.gitPathSeparator);

			if ((this.hasBaseDir && file.length === fileWithoutBaseDir.length) || !pieceTypes.includes(path[0])) {
				nonPieces.push(file);
			} else {
				if (created.includes(file)) pieces.toLoad.push(file);
				else if (deleted.includes(file)) pieces.toUnload.push(file);
				else pieces.toReload.push(file);
				assert(!(created.includes(file) && deleted.includes(file)));
			}
		}

		return { pieces, nonPieces };
	}

	_resolvePiece([store, ...path]: string[]) {
		return (<Store<string, Piece>>this.client.pieceStores.get(store))
			.find(piece => piece.file.length === path.length && piece.file.every((part, i) => path[i] === part))!;
	}

}
