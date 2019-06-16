import { MessageOptions, MessageEditOptions } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../../lib/MissyClient';
import MissyCommand from '../../../lib/structures/base/MissyCommand';
import { Sendable } from '../../../lib/util/types';

export default class extends MissyCommand {

	msgSymbol = Symbol('say command');

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Tell me to say something.',
			permissionLevel: 0,
			usage: '[channel:channel] <text:...str>',
			usageDelim: ' ',
		});
	}

	async run(msg: KlasaMessage, [channel = msg, rawText]: [Sendable, string]) {
		const text = this.client.speakerIDs.has(msg.author!.id) && msg.flags.shh
			? rawText
			: `_${msg.author} told me to say:_ ${rawText}`;
		return this.sendOrEdit(channel, text, msg);
	}

	async sendOrEdit(channel: Sendable, text: string, cmdMsg: KlasaMessage) {
		const options: MessageOptions & MessageEditOptions = {
			disableEveryone: !this.client.speakerIDs.has(cmdMsg.author!.id),
		};

		const prevMsg: KlasaMessage | undefined = (<any>cmdMsg)[this.msgSymbol];
		const saidMsg = await (prevMsg ?
			prevMsg.edit(text, options) :
			channel.send(text, options)) as KlasaMessage | KlasaMessage[];
		(<any>cmdMsg)[this.msgSymbol] = saidMsg;

		return cmdMsg === channel ?
			saidMsg :
			cmdMsg.send(`👌 I ${prevMsg ? 'edited' : 'posted'} it there.`);
	}

}
