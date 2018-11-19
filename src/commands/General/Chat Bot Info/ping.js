const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: language => language.get('COMMAND_PING_DESCRIPTION')
		});
	}

	async run(msg) {
		const pingMsg = await msg.sendLocale('COMMAND_PING', [
			this.client.ws.ping,
			new MessageEmbed().setColor(this.client.COLORS.BLUE).setThumbnail(this.client.user.displayAvatarURL()),
		]);
		return msg.sendLocale('COMMAND_PINGPONG', [
			(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp),
			new MessageEmbed(pingMsg.embeds[0]),
		]);
	}

};
