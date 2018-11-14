const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			promptLimit: 0,
			promptTime: 30000,
			permissionLevel: 0,
			description: lang => lang.get('COMMAND_SHIP_DESCRIPTION'),
			usage: '<person1:member> [with] <person2:member>',
			usageDelim: ' ',
		});
	}

	async run(msg, [person1, , person2]) {
		return msg.sendEmbed(msg.language.get('COMMAND_SHIP',
			msg, person1, person2, new MessageEmbed().setColor(this.client.COLORS.BLUE)));
	}

};
