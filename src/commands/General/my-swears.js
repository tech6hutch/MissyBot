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
			extendedHelp: lang => lang.get('COMMAND_MYSWEARS_EXTENDEDHELP'),
		});

		this.emojiRegex = /\p{Emoji_Presentation}/u;
	}

	async run(msg, [category = 'list']) {
		if (category === 'list' || category === 'all') return this[category](msg);

		return this.show(msg, this.resolveCategoryFuzzily(category));
	}

	list(msg) {
		return msg.sendEmbed(new MessageEmbed()
			.addField('Categories:', profanity.categories.join('\n')));
	}

	all(msg) {
		return this.show(msg, undefined);
	}

	show(msg, category) {
		const { profanity: userProfanity } = msg.author.settings;
		let { uncensored } = msg.flags;

		let content;
		if (uncensored && !msg.channel.nsfw) {
			if (msg.member.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
				content = msg.language.get('COMMAND_MYSWEARS_MOD_UNCENSORED');
			} else {
				uncensored = false;
				content = msg.language.get('COMMAND_MYSWEARS_NO_UNCENSORED');
			}
		}

		const embed = new MessageEmbed();
		assert(Object.keys(userProfanity).length ===
			profanity.byCategory.reduce((total, { length }) => total + length, 0));
		for (const [cat, catWords] of category ? [[category, profanity.byCategory.get(category)]] : profanity.byCategory) {
			assert(catWords.every(word => (typeof word === 'string') && (word in userProfanity)));
			embed.addField(cat, catWords.map(word =>
				`${capitalize(uncensored ? word : profanity.censors.get(word))}: ${userProfanity[word]}`
			).join('\n'));
		}
		embed.fields.sort((a, b) => countNewlines(a) - countNewlines(b));

		return msg.sendEmbed(embed, content);
	}

	resolveCategoryFuzzily(fuzzyCat) {
		{
			// Fuzzy search doesn't work well with single-chars, like emojis
			const emojiResult = this.emojiRegex.exec(fuzzyCat);
			if (emojiResult) {
				const [emoji] = emojiResult;
				for (const cat of profanity.categories) {
					if (cat.includes(emoji)) return cat;
				}
			}
		}

		fuzzyCat = fuzzyCat.toLowerCase();
		let leastDistance = Infinity;
		let closestCategory;
		for (const cat of profanity.categories) {
			const distance = strDistance(fuzzyCat, cat.toLowerCase());
			if (distance < leastDistance) {
				leastDistance = distance;
				closestCategory = cat;
			}
		}
		return closestCategory;
	}

};
