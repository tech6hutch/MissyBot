const { TextChannel } = require('discord.js');
const { Monitor, KlasaMessage } = require('klasa');

module.exports = class DMLogger extends Monitor {

	constructor(...args) {
		/**
		 * Any default options can be omitted completely.
		 * if all options are default, you can omit the constructor completely
		 */
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false,
			ignoreWebhooks: false,
			ignoreEdits: false,
		});

		/**
		 * @type {TextChannel}
		 */
		this.logChannel = null;
	}

	/**
	 * @param {KlasaMessage} msg The message
	 */
	async run(msg) {
		if (msg.channel.type !== 'dm') return;

		const { author, content } = msg;
		const text = `From: ${author} (${author.tag})\n${content}`;
		this.logChannel.send(text.substring(0, 2000));
	}

	init() {
		this.logChannel = this.client.channels.get('502235589752520715');
	}

};
