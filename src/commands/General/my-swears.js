const assert = require('assert');
const strDistance = require('js-levenshtein');
const { MessageEmbed, Permissions } = require('discord.js');
const { Command } = require('klasa');
const IconifiedDisplay = require('../../lib/util/IconifiedDisplay');
const ReactionHandler = require('../../lib/util/ReactionHandler');
const profanity = require('../../lib/profanity');

const emojiRegex = /\p{Emoji_Presentation}/u;
const capitalize = (firstLetterOrPart =>
	str => str.replace(firstLetterOrPart, chars => chars.toUpperCase())
)(/^(?:([a-z])+-|([a-z]))/);

class ProfanityDisplay extends IconifiedDisplay {

	constructor(msg) {
		const { profanity: userProfanity } = msg.author.settings;
		const { censor, content = '' } = MySwearsCmd.determineCensorshipAndContent(msg);
		const template = new MessageEmbed()
			.setColor(msg.client.COLORS[censor ? 'WHITE' : 'BLACK'])
			.setAuthor(msg.member ? msg.member.displayName : msg.author.username, msg.author.displayAvatarURL());

		// To make sure I don't derp and mutate the template BEFORE super() gets called
		Object.freeze(template);
		for (const key of Object.keys(template)) {
			if (typeof template[key] === 'object') Object.freeze(template[key]);
		}

		super({
			template,
			user: msg.author,
			msgContent: content,

			infoPage: (() => {
				const infoPage = new MessageEmbed(template)
					.setTitle('Your Swears')
					.setDescription('Use the reactions to view a particular category.');

				let totalWords = 0;
				let totalSwears = 0;

				for (const [cat, catWords] of profanity.byCategory) {
					const numWords = catWords.length;
					const numSwears = catWords.reduce((sum, word) => sum + userProfanity[word], 0);
					infoPage.addField(cat, [
						`Words: ${numWords}`,
						`Your swears: ${numSwears}`,
					].join('\n'), true);
					totalWords += numWords;
					totalSwears += numSwears;
				}

				infoPage.addField('Total', [
					`Words: ${totalWords}`,
					`Your swears: ${totalSwears}`,
				].join('\n'));

				// Move "Total" field to the beginning
				infoPage.fields.unshift(infoPage.fields.pop());

				return infoPage;
			})(),

			pages: profanity.byCategory.reduce((pages, catWords, cat) => {
				pages[cat] = new MessageEmbed(template)
					.setTitle(cat)
					.setDescription(catWords.map(word =>
						`${capitalize(censor ? profanity.censors.get(word) : word)}: ${userProfanity[word]}`
					).join('\n'));
				return pages;
			}, {}),

			emojis: profanity.byCategory.reduce((emojis, _, cat) => {
				const emoji = emojiRegex.exec(cat);
				emojis[cat] = emoji ? emoji[0] : '❓';
				return emojis;
			}, {})
		});
	}

	run(msg) {
		return super.run(msg, {
			time: 60000,
			spamLimit: {
				warn: 3,
				stop: 5,
			},
		});
	}

}

class ProfanityReactionHandler extends ReactionHandler {

	constructor(...args) {
		super(...args);
		for (const cat of profanity.categories) {
			this[cat] = () => this.message.edit(this.display.pages[cat]);
		}
	}

}

ProfanityDisplay.ReactionHandler = ProfanityReactionHandler;

class MySwearsCmd extends Command {

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
		const display = new ProfanityDisplay(msg);

		const reactionHandler = await display.run(await msg.send('Loading swears...'));
		assert(reactionHandler instanceof ProfanityReactionHandler);
		return reactionHandler;
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

}

module.exports = MySwearsCmd;
