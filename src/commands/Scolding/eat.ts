import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: lang => lang.get('COMMAND_EAT_DESCRIPTION'),
			usage: '[breakfast|lunch|dinner|supper|snack|something] [who:mention]',
			usageDelim: ' ',
		});
	}

	async run(msg: KlasaMessage, [meal, who = this.client.user!]: [string | undefined, User?]) {
		if (!meal) {
			who = this.client.user!;
			meal = 'something';
		}
		return msg.sendLocale('COMMAND_EAT', [who, meal, msg]);
	}

}
