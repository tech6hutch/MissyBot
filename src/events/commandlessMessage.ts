import { Snowflake } from 'discord.js';
import { KlasaMessage, Monitor } from 'klasa';
import MissyEvent from '../lib/structures/base/MissyEvent';

export default class CmdlessMsgEvent extends MissyEvent {

	memePingers: Snowflake[] = [
		// Hutch
		'224236171838881792',
		// Kru
		'168161111210852352',
	];

	async run(msg: KlasaMessage, prefix: RegExp) {
		if (await this.client.inhibitors.get('ignoreNotYou').run(msg, undefined!)) return undefined;

		if (prefix) {
			const reply = await msg.awaitMsg(msg.language.get('EVENT_COMMANDLESS_MESSAGE_LISTEN'), 30000);
			return reply ? this.handlePrefixlessCommand(reply) : undefined;
		}

		if (msg.mentions.has(this.client.user!)) {
			return msg.send(this.memePingers.includes(msg.author.id) ?
				msg.language.get('EVENT_COMMANDLESS_MESSAGE_MENTION_MEMERS') :
				msg.language.getRandom('EVENT_COMMANDLESS_MESSAGE_MENTION'));
		}

		return undefined;
	}

	async handlePrefixlessCommand(msg: KlasaMessage) {
		const cmdHandler = this.client.monitors.get('commandHandler') as Monitor & {
			parseCommand(msg: KlasaMessage): { prefix: string },
			runCommand(msg: KlasaMessage): Promise<any>,
		};

		// If there's a prefix, the regular command handler will handle it.
		if (cmdHandler.parseCommand(msg).prefix !== undefined) return undefined;

		const commandText = msg.content.trim().split(' ')[0].toLowerCase();
		const prefix = null;
		const prefixLength = 0;

		if (!commandText) return this.client.emit('commandlessMessage', msg, prefix, prefixLength);

		const command = this.client.commands.get(commandText);
		if (!command) return this.client.emit('commandUnknown', msg, commandText, prefix, prefixLength);

		// @ts-ignore KlasaMessage#_registerCommand is private (also some other prefix null bs idk)
		return cmdHandler.runCommand(msg._registerCommand({ command, prefix, prefixLength }));
	}

}
