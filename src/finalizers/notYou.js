const assert = require('assert');
const { Finalizer } = require('klasa');
const { arrayRandom } = require('../lib/util');

module.exports = class NotYouFinalizer extends Finalizer {

	constructor(...args) {
		super(...args);

		this.trigger = 'not you';
		this.responses = [
			'Oh, sorry!',
			"Alright, I'll go play somewhere else",
		];
	}

	async run(msg) {
		const collected = await msg.channel.awaitMessages(
			m => m.content.toLowerCase().includes(this.trigger) && m.content.length <= this.trigger.length + 3,
			{ max: 1, time: 10000, errors: ['time'] }
		).then(() => true).catch(() => false);
		if (!collected) return;
		this.ignoreChannel(msg);
	}

	ignoreChannel(msg) {
		this.client.ignoredChannels.add(msg.channel.id);
		return msg.channel.send(arrayRandom(this.responses));
	}

};
