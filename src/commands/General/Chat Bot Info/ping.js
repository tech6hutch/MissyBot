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
		const pingMsg = await msg.sendEmbed(new MessageEmbed(
			msg.language.get('COMMAND_PING', this.client.ping)
		).setColor(this.client.COLORS.BLUE));
		return msg.sendEmbed(new MessageEmbed(
			msg.language.get('COMMAND_PINGPONG',
				(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp),
				pingMsg.embeds[0])
		));
	}

};
