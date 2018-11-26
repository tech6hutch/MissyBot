import assert from 'assert';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/MissyCommand';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: lang => lang.get('COMMAND_BIRTHDAY_DESCRIPTION'),
			usage: '[birthdayPerson:mention] [...]',
			usageDelim: ' ',
		});
	}

	async run(msg: KlasaMessage, birthdayPeople: KlasaUser[]) {
		return msg.sendLoading(() => this.client.assets.get('happy-birthday').uploadTo(msg, {}, {
			caption: msg.language.get(
				birthdayPeople.length > 0 ? 'COMMAND_BIRTHDAY_MENTIONS' : 'COMMAND_BIRTHDAY',
				birthdayPeople
			),
		}));
	}

	async init() {
		assert(this.client.assets.has('happy-birthday'));
	}

}
