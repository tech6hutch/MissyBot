import { GuildMember, TextChannel } from 'discord.js';
import { Argument, Possible, KlasaMessage } from 'klasa';

export default class extends Argument {

	async run(arg: string, possible: Possible, message: KlasaMessage) {
		let member: GuildMember | null = null;

		const { guild } = message;
		if (guild) {
			if (arg.trim().toLowerCase() === '@someone') {
				member = await guild.members.randomWhoBlocksMeNot(message.channel as TextChannel) ||
					await guild.members.fetch((Math.random() >= 0.5 ? this.client.user : message.author)!.id);
			} else if (Argument.regex.userOrMember.test(arg)) {
				member = await guild.members.fetch(Argument.regex.userOrMember.exec(arg)![1]).catch(() => null);
			}
		}

		if (member) return member;
		throw message.language.get('RESOLVER_INVALID_MEMBER', possible.name);
	}

}
