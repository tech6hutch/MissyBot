import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../../lib/MissyClient';
import MissyCommand from '../../../lib/structures/MissyCommand';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['details'],
			guarded: true,
			description: language => language.get('COMMAND_INFO_DESCRIPTION')
		});
	}

	async run(message: KlasaMessage) {
		return message.sendLocale('COMMAND_INFO');
	}

}
