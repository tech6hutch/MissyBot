const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
			ignoreEdits: false,
		});
	}

	async run(msg) {
		if (msg.mentions.has(this.client.user)) this.client.ignoredChannels.delete(msg.channel.id);
	}

};
