import { CommandStore } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import RandomImageCommand from '../../lib/structures/RandomImageCommand';

export default class extends RandomImageCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: false,
			usage: '[list|quote-name:str]',
			description: lang => lang.get('COMMAND_NOCONTEXT_DESCRIPTION'),
			// Custom
			images: [
				'minorities',
			],
		});
	}

}
