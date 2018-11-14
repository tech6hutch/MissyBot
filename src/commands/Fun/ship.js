const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			promptLimit: 0,
			promptTime: 30000,
			permissionLevel: 0,
			description: 'Tag two people to ship them!',
			usage: '<person1:member> [with] <person2:member>',
			usageDelim: ' ',
		});
	}

	async run(msg, [person1, , person2]) {
		return msg.sendLoading(() => msg.sendEmbed(
			new MessageEmbed()
				.setColor(this.client.COLORS.BLUE)
				.setTitle(`${person1.displayName} + ${person2.displayName}`)
				.setDescription(`I think ${person1} and ${person2} would be wonderful together! :D`)
				.setAuthor(msg.guild ? msg.guild.me.displayName : this.client.user.username, this.client.user.displayAvatarURL())
				.setThumbnail('https://raw.githubusercontent.com/twitter/twemoji/gh-pages/72x72/1f49e.png')
				.addField('Ship Level', '💟'.repeat(10), true)
				.addField('Ship Compatibility', '100%! ♥', true)
				.addField('Similar Interests', [
					'• Both are human',
					'• Both survive by consuming plant or animal matter',
					'• Both use Discord',
				].join('\n'), true)
				.addField('Positive Qualities', [
					'• Suitable mating partner',
					'• Body heat can defrost cold objects',
					"• You're both cuties!",
				].join('\n'), true)
				.setFooter('Go! '.repeat(4))
		), { loadingText: 'Calculating compatibility...' });
	}

};
