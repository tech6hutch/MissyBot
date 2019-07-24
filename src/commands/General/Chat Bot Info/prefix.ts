import { CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['prefixes'],
			runIn: ['text'],
			guarded: true,
			description: lang => lang.get('COMMAND_PREFIX_DESCRIPTION'),
		});
	}

	run(msg: KlasaMessage) {
		return msg.sendLocale('PREFIX_REMINDER', [msg.guildSettings]);
	}

}
