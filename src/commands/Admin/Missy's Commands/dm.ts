import { DMChannel } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import MissyClient from '../../../lib/MissyClient';
import MissyCommand from '../../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	msgSymbol = Symbol('DM command');

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Tell me to message someone.',
			permissionLevel: 9,
			usage: '[recipient:user] <text:...str>',
			usageDelim: ' ',
		});
	}

	async run(msg: KlasaMessage, [recipient = msg.author as KlasaUser, text]: [KlasaUser, string]) {
		const prevMsg: KlasaMessage | undefined = (<any>msg)[this.msgSymbol];
		const dm = await (prevMsg ?
			prevMsg.edit(text) :
			recipient.send(text)) as KlasaMessage | KlasaMessage[];
		(<any>msg)[this.msgSymbol] = dm;
		return (<DMChannel>msg.channel).recipient === recipient ?
			dm :
			msg.send(`👌 I ${prevMsg ? 'edited' : 'sent'} it.`);
	}

}
