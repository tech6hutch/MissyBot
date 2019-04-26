import { MessageEmbed, GuildMember as Member } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			runIn: ['text'],
			promptLimit: 0,
			promptTime: 30000,
			permissionLevel: 0,
			description: lang => lang.get('COMMAND_SHIP_DESCRIPTION'),
			usage: '<person1:member> [with|and] <person2:member> [as:...str]',
			usageDelim: ' ',
		});
	}

	async run(msg: KlasaMessage, [person1, , person2, asStr]: [Member, string | undefined, Member, string | undefined]) {
		return msg.sendEmbed(msg.language.get('COMMAND_SHIP',
			msg, person1, person2, asStr, new MessageEmbed().setColor(this.client.COLORS.BLUE)));
	}

}
