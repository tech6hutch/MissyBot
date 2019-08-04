import { CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			name: 'kick',
			aliases: ['fakekick'],
			description: '👢',
		});
	}

	run(msg: KlasaMessage) {
		return msg.sendLocale('COMMAND_FAKEKICK');
	}

}
