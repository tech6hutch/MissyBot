import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import { naturalPause } from '../../lib/util/util';
import { SaneGuild } from '../../lib/util/types';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: lang => lang.get('COMMAND_TYPE_DESCRIPTION'),
			usage: '<as> <name:...str{,32}>',
			usageDelim: ' ',
			extendedHelp: lang => lang.get('COMMAND_TYPE_EXTENDEDHELP',
				'Missy, type as FBI'),
			runIn: ['text'],
			requiredPermissions: ['CHANGE_NICKNAME'],
		});
	}

	async run({ channel, guild }: KlasaMessage, [, name]: string[]) {
		const { me, me: { nickname } } = guild as SaneGuild;
		await me.setNickname(name, 'type cmd start');
		channel.startTyping();
		await naturalPause('long');
		channel.stopTyping();
		await me.setNickname(nickname, 'type cmd end');
		return null;
	}

}
