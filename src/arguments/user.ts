import { User, TextChannel } from 'discord.js';
import { Argument, Possible, KlasaMessage, KlasaClient, ArgumentStore } from 'klasa';
import { GuildMessage } from '../lib/util/types';

export default class extends Argument {

	constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string) {
		super(client, store, file, directory, { aliases: ['mention'] });
	}

	async run(arg: string, possible: Possible, message: KlasaMessage) {
		let user: User | null = null;

		if (arg.trim().toLowerCase() === '@someone') {
			if (message.guild) {
				user = await message.guild.members.randomWhoBlocksMeNot(message.channel as TextChannel)
					.then(maybeMember => maybeMember ? maybeMember.user : null);
			}
			if (!user) user = Math.random() >= 0.5 ? this.client.user : message.author;
		} else if (Argument.regex.userOrMember.test(arg)) {
			user = await this.client.users.fetch(Argument.regex.userOrMember.exec(arg)![1]).catch(() => null);
		}

		if (user) return user;
		throw message.language.get('RESOLVER_INVALID_USER', possible.name);
	}

}
