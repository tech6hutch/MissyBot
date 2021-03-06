import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import RebootCmd from '../Admin/reboot';
import { naturalPause } from '../../lib/util/util';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['bedtime', 'bed'],
			description: lang => lang.get('COMMAND_SLEEP_DESCRIPTION'),
			usage: '[who:mention]',
		});
	}

	async run(msg: KlasaMessage, [who = this.client.user!]: [User?]): Promise<KlasaMessage | KlasaMessage[] | never> {
		if (who.id === this.client.user!.id && await msg.hasAtLeastPermissionLevel(10)) {
			await msg.channel.send('Aw, boo. Yes sir');
			await naturalPause();
			return (<RebootCmd><MissyCommand>this.store.get('reboot')).run(msg);
		}

		return msg.sendLocale('COMMAND_SLEEP', [who, msg]);
	}

}
