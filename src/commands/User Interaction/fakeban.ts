import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/MissyCommand';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			name: 'ban',
			aliases: ['fakeban'],
			description: '👮',
		});
	}

	run(msg: KlasaMessage) {
		return msg.sendRandom('COMMAND_FAKEBAN');
	}

}
