const assert = require('assert');
const strDistance = require('js-levenshtein');
const { MessageEmbed, Permissions } = require('discord.js');
const { Command } = require('klasa');
const ReactionHandler = require('../../lib/util/ReactionHandler');
const profanity = require('../../lib/profanity');

const emojiRegex = /\p{Emoji_Presentation}/u;
const capitalize = (firstLetterOrPart =>
	str => str.replace(firstLetterOrPart, chars => chars.toUpperCase())
)(/^(?:([a-z])+-|([a-z]))/);

class ProfanityDisplay {

	constructor({ user, censor, content = '', template = new MessageEmbed() }) {
		// To make sure I don't derp and mutate the template
		Object.freeze(template);
		for (const key of Object.keys(template)) {
			if (typeof template[key] === 'object') Object.freeze(template[key]);
		}

		this.user = user;
		this.content = content;

		const { profanity: userProfanity } = user.settings;

		this.pages = profanity.byCategory.reduce((pages, catWords, cat) => {
			pages[cat] = new MessageEmbed(template)
				.setTitle(cat)
				.setDescription(catWords.map(word =>
					`${capitalize(censor ? profanity.censors.get(word) : word)}: ${userProfanity[word]}`
				).join('\n'));
			return pages;
		}, {
			info: profanity.byCategory.reduce(
				(infoPage, catWords, cat) => infoPage
					.addField(cat, [
						`Words: ${catWords.length}`,
						`Your swears: ${catWords.reduce((sum, word) => sum + userProfanity[word], 0)}`,
					].join('\n'), true),
				new MessageEmbed(template)
					.setTitle('Your Swears')
					.setDescription('Use the reactions to view a particular category.')
					.addField('Total', [
						`Words: ${profanity.byCategory.reduce((sum, catWords) => sum + catWords.length, 0)}`,
						`Your swears: ${profanity.byCategory.reduce(
							(totalSum, catWords) =>
								catWords.reduce(
									(sum, word) => sum + userProfanity[word],
									totalSum
								),
							0
						)}`,
					].join('\n'))
			),
		});

		this.emojis = profanity.byCategory.reduce((emojis, _, cat) => {
			const emoji = emojiRegex.exec(cat);
			emojis[cat] = emoji ? emoji[0] : '❓';
			return emojis;
		}, {
			info: 'ℹ',
			stop: '⏹',
		});
	}

	async run(msg) {
		const emojis = Object.values(this.emojis);
		return new ProfanityReactionHandler(
			await msg.send('', { embed: this.pages.info }),
			(reaction, user) => emojis.includes(reaction.emoji.name) && user === this.user,
			{ time: 60000 },
			this
		);
	}

}

class ProfanityReactionHandler extends ReactionHandler {

	constructor(message, filter, options, display, emojis) {
		super(message, filter, options, display, emojis);

		for (const cat of profanity.categories) {
			this[cat] = () => {
				this.message.edit(this.display.pages[cat]);
			};
		}
	}

}

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			usage: `[list|all|category:str]`,
			description: '🗣 👀',
			extendedHelp: lang => lang.get('COMMAND_MYSWEARS_EXTENDEDHELP'),
		});
	}

	async run(msg, [category = 'list']) {
		if (category === 'list' || category === 'all') return this[category](msg);

		return this.show(msg, this.constructor.resolveCategoryFuzzily(category));
	}

	async list(msg) {
		const display = new ProfanityDisplay({
			user: msg.author,
			...this.constructor.determineCensorshipAndContent(msg),
			template: new MessageEmbed()
				.setColor(0xFFFFFF)
				.setAuthor(msg.member ? msg.member.displayName : msg.author.username, msg.author.avatarURL()),
		});

		return display.run(await msg.send('Loading swears...'));
	}

	all(msg) {
		return this.show(msg, undefined);
	}

	show(msg, category) {
		const { profanity: userProfanity } = msg.author.settings;
		const { censor, content } = this.constructor.determineCensorshipAndContent(msg);

		const embed = new MessageEmbed();
		assert(Object.keys(userProfanity).length ===
			profanity.byCategory.reduce((total, { length }) => total + length, 0));
		for (const [cat, catWords] of category ? [[category, profanity.byCategory.get(category)]] : profanity.byCategory) {
			assert(catWords.every(word => (typeof word === 'string') && (word in userProfanity)));
			embed.addField(cat, catWords.map(word =>
				`${capitalize(censor ? profanity.censors.get(word) : word)}: ${userProfanity[word]}`
			).join('\n'));
		}

		return msg.sendEmbed(embed, content);
	}

	static determineCensorshipAndContent(msg) {
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

		return { censor: !uncensored, content };
	}

	static resolveCategoryFuzzily(fuzzyCat) {
		// Fuzzy search doesn't work well with single-chars, like emojis, which are unique enough to select by.
		const emojiResult = emojiRegex.exec(fuzzyCat);
		if (emojiResult) {
			const [emoji] = emojiResult;
			for (const cat of profanity.categories) {
				if (cat.includes(emoji)) return cat;
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
