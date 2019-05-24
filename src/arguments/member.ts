import { GuildMember } from 'discord.js';
import { Argument, Possible, KlasaMessage } from 'klasa';

export default class extends Argument {

	async run(arg: string, possible: Possible, message: KlasaMessage) {
		let member: GuildMember | null = null;

		const { guild } = message;
		if (guild) {
			if (arg.trim().toLowerCase() === '@someone') {
				member = guild.members.random() || await guild.members.fetch(this.client.user!.id);
			} else {
				const idRegexResult = Argument.regex.userOrMember.exec(arg);
				if (idRegexResult) member = await guild.members.fetch(idRegexResult[1]).catch(() => null);
			}
		}

		if (member) return member;
		throw message.language.get('RESOLVER_INVALID_MEMBER', possible.name);
	}

}
