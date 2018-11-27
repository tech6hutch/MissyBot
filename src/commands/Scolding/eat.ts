import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: lang => lang.get('COMMAND_EAT_DESCRIPTION'),
			usage: '[breakfast|lunch|dinner|supper|snack|something] [who:mention]',
			usageDelim: ' ',
		});
	}

	async run(msg: KlasaMessage, [meal, who = this.client.user!]: [string | undefined, User?]) {
		return msg.sendRandom(
			who.id === this.client.user!.id || !meal ? 'COMMAND_EAT_SELF' : 'COMMAND_EAT',
			[meal, who, msg.author],
			[msg]
		);
	}

}
