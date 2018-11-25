import { Command, CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../../lib/MissyClient';
import { Sendable } from '../../../lib/util/types';

export default class extends Command {

	msgSymbol = Symbol('say command');

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Tell me to say something.',
			permissionLevel: 8,
			usage: '[channel:channel] <text:...str>',
			usageDelim: ' ',
		});
	}

	async run(msg: KlasaMessage, [channel = msg, text]: [Sendable, string]) {
		const prevMsg: KlasaMessage | undefined = (<any>msg)[this.msgSymbol];
		const saidMsg = await (prevMsg ?
			prevMsg.edit(text) :
			channel.send(text)) as KlasaMessage | KlasaMessage[];
		(<any>msg)[this.msgSymbol] = saidMsg;
		return msg === channel ?
			saidMsg :
			msg.send(`👌 I ${prevMsg ? 'edited' : 'posted'} it there.`);
	}

};
