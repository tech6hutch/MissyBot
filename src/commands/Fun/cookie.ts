import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			promptLimit: 3,
			description: lang => lang.get('COMMAND_COOKIE_DESCRIPTION'),
			usage: '<milk:yesno> [for:user]',
			usageDelim: ' for ',
			extendedHelp: [
				'Examples:',
				'Missy, cookie -> Want some milk with that? -> yes',
				'Missy, cookie with milk',
				'Missy, cookie no milk for @Missy',
			].join('\n'),
		});

		this
			.customizeResponse('milk', 'Want some milk with that?')
			.createCustomResolver('yesno', (arg, possible, message) => {
				try {
					return this.client.arguments.get('yesno').run(arg, possible, message);
				} catch (yesnoError) {
					const [first] = String(arg).toLowerCase().split(' ');
					if (first === 'with') return true;
					if (first === 'without') return false;
					throw yesnoError;
				}
			});
	}

	async run(msg: KlasaMessage, [milk, forUser]: [boolean, KlasaUser?]) {
		return msg.send(`${forUser ? `${forUser} ` : ''}${milk ? '🍪🥛' : '🍪'}`);
	}

}
