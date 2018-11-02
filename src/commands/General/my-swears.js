const assert = require('assert');
const strDistance = require('js-levenshtein');
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
			usage: `[list|all|category:str]`,
			description: '🗣 👀',
			extendedHelp: [
				'I see you swearing 👀',
				'',
				"Don't worry, tho, I like swearing. I just have too much self control to do it myself 😛",
			].join('\n'),
		});
	}

	async run(msg, [category = 'list']) {
		if (category === 'list' || category === 'all') return this[category](msg);

		// TODO: smartly find the closest category to what the user typed
		let leastDistance = Infinity;
		let closestCategory;
		for (const cat of profanity.categories.keys()) {
			const distance = strDistance(cat);
			if (distance < leastDistance) {
				leastDistance = distance;
				closestCategory = cat;
			}
		}

		this.show(msg, closestCategory);
	}

	list(msg) {
		return msg.sendEmbed(new MessageEmbed()
			.addField('Categories:', [...profanity.categories.keys()].join('\n')));
	}

	all(msg) {
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

	show(msg, category) {
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
		const catWords = profanity.categories.get(this.category);
		assert(catWords.every(word => (typeof word === 'string') && (word in userProfanity)));
		embed.addField(category, catWords.map(word =>
			`${capitalize(uncensored ? word : profanity.censors.get(word))}: ${userProfanity[word]}`
		).join('\n'));

		return msg.sendEmbed(embed, content);
	}

};
