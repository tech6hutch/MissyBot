const { Command } = require('klasa');
const { arrayRandom } = require('../util/util');

module.exports = class RandomResponseCommand extends Command {

	constructor(client, store, file, directory, options = {}) {
		super(client, store, file, directory, options);

		this.defaultTerm = options.defaultTerm;
	}

	getResponse(language, term = this.defaultTerm, ...args) {
		return arrayRandom(language.get(term, ...args));
	}

	sendResponse(msg, term = this.defaultTerm, ...args) {
		return msg.send(this.getResponse(msg.language, term, ...args));
	}

};
