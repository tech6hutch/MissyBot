const assert = require('assert');
const { Command, util: { codeBlock } } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Pull in new changes from GitHub.',
			permissionLevel: 10,
		});

		// This command is very based around your base directory being "src".
		// It would need rewritten a little if your file structure is different.
		this.baseDir = 'src';
		this.pathSepsRegex = /[/\\]/;

		this.loadRegex = /\\\\?|\//g;
	}

	get defaultLang() {
		return this.client.languages.default;
	}

	async run(msg) {
		const pullResult = await this.client.git.pull();

		const { pieces, nonPieces } = this._segregateChanges(pullResult);

		const { changes, insertions, deletions } = pullResult.summary;
		await msg.channel.send([
			`**${changes}** files changed (**${insertions}** insertions, **${deletions}** deletions).`,
			'\u200b',
			...pieces.toLoad.length ? ['Pieces to load:', codeBlock('prolog', pieces.toLoad.join('\n')), '\u200b'] : [],
			...pieces.toReload.length ? ['Pieces to reload:', codeBlock('prolog', pieces.toReload.join('\n')), '\u200b'] : [],
			...pieces.toUnload.length ? ['Pieces to unload:', codeBlock('prolog', pieces.toUnload.join('\n')), '\u200b'] : [],
			...nonPieces.length ? ['Non-piece files changed:', codeBlock('prolog', nonPieces.join('\n')), '\u200b'] : [],
		], { split: { char: '\u200b' } });

		if (nonPieces.length) {
			return await msg.ask('Non-piece files changed. **Reboot the bot?**') ?
				this.store.get('reboot').run(msg) :
				null;
		}

		if (Object.values(pieces).some(pieceArray => pieceArray.length)) {
			if (!await msg.ask('**Load piece changes?**')) return null;
			await this.handlePieceChanges(pieces);
			return msg.send('Done 👌🏽 (but check console for any errors)');
		}

		return msg.send('No new changes.');
	}

	async handlePieceChanges(pieces) {
		for (const file of pieces.toLoad) {
			try {
				// e.g., ['src', 'commands', 'Admin', 'eval.js']
				const path = file.split(this.pathSepsRegex);
				await this.loadPiece(this.client.pieceStores.get(path[1]), path.slice(2).join('/'));
			} catch (e) {
				this.client.emit('wtf', e);
			}
		}

		for (const file of pieces.toReload) {
			try {
				// e.g., ['src', 'commands', 'Admin', 'eval.js']
				const path = file.split(this.pathSepsRegex);
				await this.reloadPiece(this._resolvePiece(path));
			} catch (e) {
				this.client.emit('wtf', e);
			}
		}

		for (const file of pieces.toUnload) {
			try {
				// e.g., ['src', 'commands', 'Admin', 'eval.js']
				const path = file.split(this.pathSepsRegex);
				await this.unloadPiece(this._resolvePiece(path));
			} catch (e) {
				this.client.emit('wtf', e);
			}
		}
	}

	_segregateChanges(pullResult) {
		const { files, created, deleted } = pullResult;

		const pieces = { toLoad: [], toReload: [], toUnload: [] };
		const nonPieces = [];
		const pieceTypes = this.client.pieceStores.keyArray();
		for (const file of files) {
			// e.g., ['src', 'commands', 'Admin', 'eval.js']
			const path = file.split(this.pathSepsRegex);
			if (path[0] === this.baseDir && pieceTypes.includes(path[1])) {
				if (created.includes(file)) pieces.toLoad.push(file);
				else if (deleted.includes(file)) pieces.toUnload.push(file);
				else pieces.toReload.push(file);
				assert(!(created.includes(file) && deleted.includes(file)));
			} else {
				nonPieces.push(file);
			}
		}

		return { pieces, nonPieces };
	}

	_resolvePiece(path) {
		// e.g., ['Admin', 'eval.js']
		const storedPath = path.slice(2);
		return this.client.pieceStores.get(path[1])
			.find(piece => piece.file.length === storedPath.length && piece.file.every((part, i) => storedPath[i] === part));
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

};
