import { MessageEmbed } from 'discord.js';
import { KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../../lib/structures/MissyCommand';
import { scalarOrFirst } from '../../../lib/util/util';

export default class extends MissyCommand {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			guarded: true,
			description: language => language.get('COMMAND_PING_DESCRIPTION')
		});
	}

	async run(msg: KlasaMessage) {
		const pingMsg = scalarOrFirst(await msg.sendLocale('COMMAND_PING', [
			this.client.ws.ping,
			new MessageEmbed().setColor(this.client.COLORS.BLUE).setThumbnail(this.client.user!.displayAvatarURL()),
		]));
		return msg.sendLocale('COMMAND_PINGPONG', [
			(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp),
			new MessageEmbed(pingMsg.embeds[0]),
		]);
	}

}