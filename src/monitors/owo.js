const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreSelf: false,
			ignoreOthers: false,
			ignoreWebhooks: false,
			ignoreEdits: false,
		});
		this.regex = /\b[ou]w[ou]\b/i;
	}

	async run(msg) {
		if (this.regex.test(msg.content)) msg.react('👀');
	}

};
