const { Command } = require('klasa');

module.exports = class MissyCommand extends Command {

	constructor(client, store, file, directory, options = {}) {
		super(client, store, file, directory, options);

		this.helpListName = options.helpListName || this.name;
		this.helpUsage = options.helpUsage || this.usage.nearlyFullUsage;
	}

};
