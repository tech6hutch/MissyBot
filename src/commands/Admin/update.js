const assert = require('assert');
const { Command, util: { codeBlock, regExpEsc } } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
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

		this.gitPathSeparator = '/';

		this.loadRegex = /\\\\?|\//g;
	}

	get defaultLang() {
		return this.client.languages.default;
	}

	run(msg) {
		return msg.sendLoading(() => this.updateBot(msg), { loadingText: 'Pulling changes from GitHub...' });
	}

	async updateBot(msg) {
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
			return await msg.channel.ask(msg.author, 'Non-piece files changed. **Reboot the bot?**').catch(() => false) ?
				this.store.get('reboot').run(msg) :
				null;
		}

		if (Object.values(pieces).some(arr => arr.length)) {
			const qMsg = await msg.channel.ask(msg.author, '**Load piece changes?**').catch(() => false);
			if (!qMsg) return null;
			await this.handlePieceChanges(pieces);
			return qMsg.send('Done 👌🏽 (but check console for any errors)');
		}

		return msg.send('No new changes.');
	}

	eatBaseDir(path) {
		return this.hasBaseDir ? path.replace(this.baseDirRegex, '') : path;
	}

	async handlePieceChanges(pieces) {
		for (const file of pieces.toLoad) {
			try {
				// e.g., ['commands', 'Admin', 'eval.js']
				const path = this.eatBaseDir(file).split(this.gitPathSeparator);
				await this.loadPiece(this.client.pieceStores.get(path[0]), path.slice(1).join('/'));
			} catch (e) {
				this.client.emit('wtf', e);
			}
		}

		for (const file of pieces.toReload) {
			try {
				// e.g., ['commands', 'Admin', 'eval.js']
				const path = this.eatBaseDir(file).split(this.gitPathSeparator);
				await this.reloadPiece(this._resolvePiece(path));
			} catch (e) {
				this.client.emit('wtf', e);
			}
		}

		for (const file of pieces.toUnload) {
			try {
				// e.g., ['commands', 'Admin', 'eval.js']
				const path = this.eatBaseDir(file).split(this.gitPathSeparator);
				await this.unloadPiece(this._resolvePiece(path));
			} catch (e) {
				this.client.emit('wtf', e);
			}
		}
	}

	async loadPiece(store, path) {
		path = (path.endsWith('.js') ? path : `${path}.js`).split(this.loadRegex);
		const piece = await store.load(store.userDirectory, path);

		try {
			if (!piece) throw this.defaultLang.get('COMMAND_LOAD_FAIL');
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.shard.id) !== '${this.client.shard.id}') {
						const piece = this.${piece.store}.load('${piece.directory}', ${JSON.stringify(path)});
						if (piece) piece.init();
					}
				`);
			}
			return true;
		} catch (error) {
			throw this.defaultLang.get('COMMAND_LOAD_ERROR', store.name, piece ? piece.name : path.join('/'), error);
		}
	}

	async reloadPiece(piece) {
		try {
			await piece.reload();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.shard.id) !== '${this.client.shard.id}') this.${piece.store}.get('${piece.name}').reload();
				`);
			}
			return true;
		} catch (_) {
			piece.store.set(piece);
			throw this.defaultLang.get('COMMAND_RELOAD_FAILED', [piece.type, piece.name]);
		}
	}

	async unloadPiece(piece) {
		piece.unload();
		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
				if (String(this.shard.id) !== '${this.client.shard.id}') this.${piece.store}.get('${piece.name}').unload();
			`);
		}
		return true;
	}

	_segregateChanges(pullResult) {
		const { files, created, deleted } = pullResult;

		const pieces = { toLoad: [], toReload: [], toUnload: [] };
		const nonPieces = [];
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

	_resolvePiece([store, ...path]) {
		return this.client.pieceStores.get(store)
			.find(piece => piece.file.length === path.length && piece.file.every((part, i) => path[i] === part));
	}

};
