import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			name: 'ban',
			aliases: ['fakeban'],
			description: '👮',
		});
	}

	run(msg: KlasaMessage) {
		return msg.sendRandom('COMMAND_FAKEBAN');
	}

}
