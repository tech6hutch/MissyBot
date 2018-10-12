const { Event } = require('klasa');
const { arrayRandom } = require('../lib/util');

class CmdlessMsgEvent extends Event {

	constructor(...args) {
		super(...args);

		this.responses = [
			'Did someone mention me?',
			'You called?',
			'Yay! Mentions!',
		];
	}

	async run(msg, prefix) {
		if (await this.client.inhibitors.get('ignoreNotYou').run(msg)) return undefined;

		if (prefix) {
			const reply = await msg.awaitMsg('Yes? 👂', 30000);
			return reply ? this.handlePrefixlessCommand(reply) : undefined;
		}

		if (msg.mentions.has(this.client.user)) {
			return msg.send([CmdlessMsgEvent.hutch, CmdlessMsgEvent.kru].includes(msg.author.id) ?
				'Was it Hutch or Kru this time? XD' :
				arrayRandom(this.responses));
		}

		return undefined;
	}

	async handlePrefixlessCommand(msg) {
		const cmdHandler = this.client.monitors.get('commandHandler');

		// If there's a prefix, the regular command handler will handle it.
		if (cmdHandler.parseCommand(msg).prefix !== undefined) return undefined;

		const commandText = msg.content.trim().split(' ')[0].toLowerCase();
		const prefix = null;
		const prefixLength = 0;

		if (!commandText) return this.client.emit('commandlessMessage', msg, prefix, prefixLength);

		const command = this.client.commands.get(commandText);
		if (!command) return this.client.emit('commandUnknown', msg, commandText, prefix, prefixLength);

		return cmdHandler.runCommand(msg._registerCommand({ command, prefix, prefixLength }));
	}

}

CmdlessMsgEvent.hutch = '224236171838881792';
CmdlessMsgEvent.kru = '168161111210852352';

module.exports = CmdlessMsgEvent;
