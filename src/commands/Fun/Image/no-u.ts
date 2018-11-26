import assert from 'assert';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../../lib/structures/MissyCommand';
import MissyClient from '../../../lib/MissyClient';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['no', 'no u'],
			description: 'no u 🔀',
			usage: '<u|you> [infinity]',
			usageDelim: ' ',
			helpListName: 'no u',
			helpUsage: 'no <u|you> [infinity]',
			extendedHelp: lang => lang.get('COMMAND_NOU_EXTENDEDHELP', [
				'Missy, no u',
				'Missy, no u infinity',
			]),
		});
	}

	async run(msg: KlasaMessage, [, infinity]: [string, string?]) {
		return msg.sendLoading(
			() => this.client.assets.get(`no-u${infinity ? '-infinity' : ''}`).uploadTo(msg),
			{ loadingText: msg.language.get('COMMAND_NOU_LOADING_TEXT') }
		);
	}

	async init() {
		assert(this.client.assets.has('no-u'));
		assert(this.client.assets.has('no-u-infinity'));
	}

}
