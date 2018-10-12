const { Inhibitor } = require('klasa');

module.exports = class NotYouInhibitor extends Inhibitor {

	async run(msg, _, { prefix = msg.prefix } = {}) {
		return prefix !== this.client.monitors.get('commandHandler').prefixMention &&
		this.client.ignoredChannels.has(msg.channel.id) ?
			true :
			undefined;
	}

};
