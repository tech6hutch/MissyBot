import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../../lib/structures/base/MissyCommand';
import { sleep } from '../../../lib/util/util';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			guarded: true,
			description: language => language.get('COMMAND_PING_DESCRIPTION')
		});
	}

	async run(msg: KlasaMessage) {
		const halfSecond = sleep(500);
		const pingMsg = await msg.sendLocale('COMMAND_PING', [
			this.client.ws.ping,
			new MessageEmbed().setColor(this.client.COLORS.BLUE).setThumbnail(this.client.user!.displayAvatarURL()),
		]) as KlasaMessage;
		// Editing messages too quickly can do weird things, so make sure it's at least been 0.5s
		await halfSecond;

		return msg.sendLocale('COMMAND_PINGPONG', [
			(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp),
			new MessageEmbed(pingMsg.embeds[0]),
		]);
	}

}
