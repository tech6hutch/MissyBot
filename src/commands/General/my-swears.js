const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['myswears'],
			description: '🗣 👀',
			extendedHelp: [
				'I see you swearing 👀',
				'',
				"Don't worry, tho, I like swearing. I just have too much self control to do it myself 😛",
			],
		});
	}

	run(msg) {
		const { profanity } = msg.author.settings;
		const embed = new MessageEmbed();
		for (const [word, counter] of Object.entries(profanity)) {
			embed.addField(`${word[0]}-word`, counter, true);
		}
		return msg.sendEmbed(embed);
	}

};
