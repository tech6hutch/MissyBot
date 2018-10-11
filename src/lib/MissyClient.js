const { Client } = require('klasa');

module.exports = class MissyClient extends Client {

	constructor(...args) {
		super(...args);

		this.ignoredChannels = new Set();
	}

};
