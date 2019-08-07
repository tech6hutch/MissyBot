import { KlasaUser, CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<target:user>',
			description: language => language.get('COMMAND_PING_DESCRIPTION')
		});
	}

	async run(msg: KlasaMessage, [user]: [KlasaUser]) {
		// todo
		return null;
	}

}
