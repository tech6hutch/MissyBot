import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			name: 'kick',
			aliases: ['fakekick'],
			description: '👢',
		});
	}

	run(msg: KlasaMessage) {
		return msg.sendRandom('COMMAND_FAKEKICK');
	}

}
