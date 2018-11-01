const assert = require('assert');
const { MessageEmbed, Permissions } = require('discord.js');
const { Command } = require('klasa');
const profanity = require('../../lib/profanity');

const firstLetterOrPart = /^(?:([a-z])+-|([a-z]))/;
const capitalize = str => str.replace(firstLetterOrPart, chars => chars.toUpperCase());
const substringCount = regex => str => (str.value.match(regex) || []).length;
const countNewlines = substringCount(/\n/g);

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

	async run(msg) {
		const { profanity: userProfanity } = msg.author.settings;
		let { uncensored } = msg.flags;

		let content;
		if (uncensored && !msg.channel.nsfw) {
			if (msg.member.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
				content = "The uncensored version is normally restricted to NSFW channels, but since you're a mod I'll assume you know what you're doing.";
			} else {
				uncensored = false;
				content = 'You can only view the uncensored version in a NSFW channel!';
			}
		}

		const embed = new MessageEmbed();
		assert(Object.keys(userProfanity).length ===
			[...profanity.categories.values()].reduce((total, { length }) => total + length, 0));
		for (const [category, catWords] of profanity.categories) {
			assert(catWords.every(word => (typeof word === 'string') && (word in userProfanity)));
			embed.addField(category, catWords.map(word =>
				`${capitalize(uncensored ? word : profanity.censors.get(word))}: ${userProfanity[word]}`
			).join('\n'));
		}
		embed.fields.sort((a, b) => countNewlines(a) - countNewlines(b));

		return msg.sendEmbed(embed, content);
	}

};
