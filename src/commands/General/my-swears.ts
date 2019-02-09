import assert from 'assert';
import { MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import IconifiedDisplay from '../../lib/util/IconifiedDisplay';
import ReactionHandler from '../../lib/util/ReactionHandler';
import profanity from '../../lib/profanity';
import { fuzzySearch, scalarOrFirst } from '../../lib/util/util';
import { UserSettings, IndexedObj, AnyObj } from '../../lib/util/types';

const emojiRegex = /\p{Emoji_Presentation}/u;
const capitalize = (firstLetterOrPart =>
	(str: string) => str.replace(firstLetterOrPart, chars => chars.toUpperCase())
)(/^(?:([a-z])+-|([a-z]))/);

class ProfanityDisplay extends IconifiedDisplay {

	constructor(msg: KlasaMessage) {
		const userProfanity = msg.author.settings.get(UserSettings.Profanity) as UserSettings.Profanity;
		const { censor, content = '' } = MySwearsCmd.determineCensorshipAndContent(msg);
		const template = new MessageEmbed()
			.setColor((<MissyClient>msg.client).COLORS[censor ? 'WHITE' : 'BLACK'])
			.setAuthor(msg.member ? msg.member.displayName : msg.author.username, msg.author.displayAvatarURL());

		// To make sure I don't derp and mutate the template BEFORE super() gets called
		Object.freeze(template);
		for (const key of Object.keys(template)) {
			if (typeof (<AnyObj>template)[key] === 'object') Object.freeze((<AnyObj>template)[key]);
		}

		super({
			template,
			user: msg.author as KlasaUser,
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
				infoPage.fields.unshift(infoPage.fields.pop()!);

				return infoPage;
			})(),

			pages: profanity.byCategory.reduce((pages: IndexedObj<MessageEmbed>, catWords, cat) => {
				pages[cat] = new MessageEmbed(template)
					.setTitle(cat)
					.setDescription(catWords.map(word =>
						`${capitalize(censor ? profanity.censors.get(word)! : word)}: ${userProfanity[word]}`
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

	run(msg: KlasaMessage) {
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

	constructor(...args: any[]) {
		// @ts-ignore
		super(...args);
		for (const cat of profanity.categories) {
			(<AnyObj>this)[cat] = () => this.message.edit(this.display.pages[cat]);
		}
	}

}

ProfanityDisplay.ReactionHandler = ProfanityReactionHandler;

export default class MySwearsCmd extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			usage: `[list|all|category:str]`,
			description: '🗣 👀',
			extendedHelp: lang => lang.get('COMMAND_MYSWEARS_EXTENDEDHELP'),
			optionalPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
		});
	}

	async run(msg: KlasaMessage, [category = 'list']): Promise<KlasaMessage | KlasaMessage[]> {
		if (category === 'list' || category === 'all') return (<(msg: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[]>>this[category])(msg);

		return this.show(msg, MySwearsCmd.resolveCategoryFuzzily(category));
	}

	async list(msg: KlasaMessage) {
		const display = new ProfanityDisplay(msg);

		const reactionHandler = await display.run(scalarOrFirst(await msg.send('Loading swears...')));
		assert(reactionHandler instanceof ProfanityReactionHandler);
		return reactionHandler;
	}

	all(msg: KlasaMessage) {
		return this.show(msg, undefined);
	}

	show(msg: KlasaMessage, category?: string) {
		const userProfanity = msg.author.settings.get(UserSettings.Profanity) as UserSettings.Profanity;
		const { censor, content } = MySwearsCmd.determineCensorshipAndContent(msg);

		const embed = new MessageEmbed();
		assert(Object.keys(userProfanity).length ===
			profanity.byCategory.reduce((total, { length }) => total + length, 0));
		for (const [cat, catWords] of category ? [<[string, string[]]>[category, profanity.byCategory.get(category)!]] : profanity.byCategory) {
			assert(catWords.every(word => (typeof word === 'string') && (word in userProfanity)));
			embed.addField(cat, catWords.map(word =>
				`${capitalize(censor ? profanity.censors.get(word)! : word)}: ${userProfanity[word]}`
			).join('\n'));
		}

		return msg.sendEmbed(embed, content);
	}

	static determineCensorshipAndContent(msg: KlasaMessage) {
		let uncensored: string | undefined | false = msg.flags.uncensored;

		let content: string | undefined;
		if (uncensored && !(<TextChannel>msg.channel).nsfw) {
			if (msg.member.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
				content = msg.language.get('COMMAND_MYSWEARS_MOD_UNCENSORED');
			} else {
				uncensored = false;
				content = msg.language.get('COMMAND_MYSWEARS_NO_UNCENSORED');
			}
		}

		return { censor: !uncensored, content };
	}

	static resolveCategoryFuzzily(fuzzyCat: string): string {
		// Fuzzy search doesn't work well with single-chars, like emojis, which are unique enough to select by.
		const emojiResult = emojiRegex.exec(fuzzyCat);
		if (emojiResult) {
			const [emoji] = emojiResult;
			for (const cat of profanity.categories) {
				if (cat.includes(emoji)) return cat;
			}
		}

		return fuzzySearch(fuzzyCat, profanity.categories);
	}

}
