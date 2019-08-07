import { CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pats'],
			description: lang => lang.get('COMMAND_PAT_DESCRIPTION'),
		});
	}

	run(msg: KlasaMessage) {
		return msg.send('_Pat pat_');
	}

}
