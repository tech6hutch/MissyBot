const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {

	constructor(...args) {
		super(...args);

		/**
		 * @type {Map<string, Promise<boolean>>}
		 */
		this.watchedChannels = new Map();

		this.regex = /not you(,? ?missy)?/i;
	}

	async run(msg) {
		const channelID = msg.channel.id;

		const notYouPromise = msg.channel.awaitMessages(
			m => {
				const match = this.regex.exec(m.content);
				return match && match[0].length + 3 >= m.content.length;
			},
			{ max: 1, time: 10000, errors: ['time'] }
		);
		// This will overwrite the current one for the channel, if any
		this.watchedChannels.set(channelID, notYouPromise);

		const notYou = await notYouPromise
			// Make sure it's still the most recent "not you" collector for the channel
			.then(() => notYouPromise === this.watchedChannels.get(channelID))
			.catch(() => false);
		if (notYou) this.ignoreChannel(msg);
	}

	ignoreChannel(msg) {
		this.client.ignoredChannels.add(msg.channel.id);
		return msg.channel.sendRandom('FINALIZER_NOTYOU');
	}

};
