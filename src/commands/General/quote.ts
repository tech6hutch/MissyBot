import { KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import RandomImageCommand from '../../lib/base/RandomImageCommand';

export default class extends RandomImageCommand {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			enabled: false,
			aliases: ['no-context'],
			usage: '[list|quote-name:str]',
			description: lang => lang.get('COMMAND_QUOTE_DESCRIPTION'),
			// Custom
			images: [
				'minorities',
			],
		});
	}

}
