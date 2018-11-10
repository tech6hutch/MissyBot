const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false,
			ignoreWebhooks: false,
			ignoreEdits: false,
		});

		this.logChannel = null;
	}

	async run(msg) {
		if (msg.channel.type !== 'dm') return;

		const { author, content } = msg;
		const text = `${msg._edits.length ? 'Edit' : 'From'}: ${author} (${author.tag})\n${content}`;
		this.logChannel.send(text.substring(0, 2000));
	}

	init() {
		this.logChannel = this.client.channels.get('502235589752520715') || { send: () => null };
	}

};
