import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/MissyCommand';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: lang => lang.get('COMMAND_PAT_DESCRIPTION'),
		});
	}

	run(msg: KlasaMessage) {
		return msg.send('_Pat pat_');
	}

}
