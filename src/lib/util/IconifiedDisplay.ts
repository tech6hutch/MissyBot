import { MessageEmbed as Embed, MessageReaction, Message } from 'discord.js';
import { KlasaUser } from 'klasa';
import ReactionHandler, { Emoji, ReactionHandlerOptions } from './ReactionHandler';
import { IndexedObj, AnyObj } from './types';

export default class IconifiedDisplay {

	static ReactionHandler = ReactionHandler;

	user: KlasaUser;
	content: string;
	pages: Record<'info' | string, Embed>;
	emojis: Record<'info' | 'stop' | string, Emoji>;

	constructor({
		user, infoPage, pages, emojis,
		msgContent = '', template = new Embed(),
	}: {
		user: KlasaUser, infoPage: Embed, pages: IndexedObj<Embed>, emojis: IndexedObj<Emoji>,
		msgContent?: string, template?: Embed,
	}) {
		// To make sure I don't derp and mutate the template
		Object.freeze(template);
		for (const key of Object.keys(template)) {
			if (typeof (<AnyObj>template)[key] === 'object') Object.freeze((<AnyObj>template)[key]);
		}

		this.user = user;
		this.content = msgContent;

		this.pages = {
			info: infoPage,
			...pages,
		};

		this.emojis = {
			info: 'ℹ',
			...emojis,
			stop: '⏹',
		};
	}

	async run(msg: Message, options: ReactionHandlerOptions = {}) {
		const emojis = Object.values(this.emojis);
		return new IconifiedDisplay.ReactionHandler(
			await msg.edit(this.content, { embed: this.pages.info }),
			(reaction: MessageReaction, user: KlasaUser) => emojis.includes(reaction.emoji.name) && user === this.user,
			options,
			this,
			emojis
		);
	}

}
