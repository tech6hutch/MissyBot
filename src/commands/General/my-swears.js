const assert = require('assert');
const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');
const profanity = require('../../lib/profanity');

const firstLetterOrPart = /^(?:([a-z])+-|([a-z]))/;
const capitalize = str => str.replace(firstLetterOrPart, chars => chars.toUpperCase());

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: '🗣 👀',
			extendedHelp: [
				'I see you swearing 👀',
				'',
				"Don't worry, tho, I like swearing. I just have too much self control to do it myself 😛",
			].join('\n'),
		});
	}

	run(msg) {
		const { profanity: userProfanity } = msg.author.settings;
		const embed = new MessageEmbed();
		assert(Object.keys(userProfanity).length ===
			[...profanity.categories.values()].reduce((total, { length }) => total + length, 0));
		for (const [category, catWords] of profanity.categories) {
			assert(catWords.every(word => (typeof word === 'string') && (word in userProfanity)));
			embed.addField(category,
				catWords
					.map(word => `${capitalize(profanity.censors.get(word))}: ${userProfanity[word]}`)
					.join('\n'),
				true);
		}
		// for (const [word, counter] of Object.entries(userProfanity)) {
		// 	embed.addField(`${word[0]}-word`, counter, true);
		// }
		return msg.sendEmbed(embed);
	}

};
