import { GuildMember, TextChannel } from 'discord.js';
import { Argument, Possible, KlasaMessage } from 'klasa';

export default class extends Argument {

	async run(arg: string, possible: Possible, message: KlasaMessage) {
		let member: GuildMember | null = null;

		if (message.guild) {
			if (arg.trim().toLowerCase() === '@someone') {
				member = (message.channel as TextChannel).members.random() || null;
			} else if (Argument.regex.userOrMember.test(arg)) {
				member = await message.guild.members.fetch(Argument.regex.userOrMember.exec(arg)![1]).catch(() => null);
			}
		}

		if (member) return member;
		throw message.language.get('RESOLVER_INVALID_MEMBER', possible.name);
	}

}
