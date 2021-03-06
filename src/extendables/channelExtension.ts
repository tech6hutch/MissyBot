import assert from 'assert';
import {
	TextChannel, DMChannel,
	MessageOptions, MessageEmbed,
} from 'discord.js';
import {
	Extendable, KlasaUser,
	ExtendableStore, KlasaMessage,
} from 'klasa';
import { scalarOrFirst, resolveLang } from '../lib/util/util';
import { Sendable, MissySendAliases } from '../lib/util/types';

type ExtChannel = TextChannel | DMChannel | KlasaUser;

const ExtChannelValue = [TextChannel, DMChannel, KlasaUser];

interface ExtChannelAskMethods {
	ask(user: KlasaUser, content: string, options?: MessageOptions): Promise<KlasaMessage>;
	awaitReply(this: ExtChannel, user: KlasaUser, question: string, time?: number, embed?: MessageEmbed):
		Promise<string | false>;
	awaitMsg(user: KlasaUser, question: string, time?: number, embed?: MessageEmbed):
		Promise<KlasaMessage | false>;
}

declare module 'discord.js' {
	export interface TextChannel extends MissySendAliases, ExtChannelAskMethods { }
	export interface DMChannel extends MissySendAliases, ExtChannelAskMethods { }
}

declare module 'klasa' {
	export interface KlasaUser extends MissySendAliases, ExtChannelAskMethods { }
}

export default class extends Extendable {

	constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: ExtChannelValue });
	}

	// Sending responses

	/**
	 * @param cb The callback function to call in the middle
	 * @param options Extra options
	 * @param options.loadingText Text to send before the callback
	 * @returns Resolves to the return of cb
	 */
	async sendLoading<T = KlasaMessage>(this: ExtChannel, cb: (msg: KlasaMessage) => T, {
		loadingText = resolveLang(this).get('LOADING_TEXT'),
	} = {}): Promise<T> {
		const loadingMsg = scalarOrFirst(await this.sendMessage(loadingText));
		// eslint-disable-next-line callback-return
		const response = await cb(loadingMsg);
		await loadingMsg.delete();
		return response;
	}

	/**
	 * @param channel The channel you intend to post in
	 * @param cb The callback function to call in the middle
	 * @param options Extra options
	 * @param options.loadingText Text to send to this.channel before the callback
	 * @param options.doneText Text to send to this.channel after the callback
	 * @returns Resolves to a confirmation message in this.channel and the return of cb
	 */
	async sendLoadingFor<T = KlasaMessage>(this: ExtChannel, channel: Sendable, cb: (msg: Sendable) => T, {
		loadingText = resolveLang(this).get('LOADING_TEXT'),
		doneText = resolveLang(this).get('SENT_IMAGE'),
	} = {}): Promise<[KlasaMessage, T]> {
		const loadingMsg = scalarOrFirst(await this.sendMessage(loadingText));
		// eslint-disable-next-line callback-return
		const response = await cb(channel);
		return [
			scalarOrFirst(<KlasaMessage | KlasaMessage[]>await (
				loadingMsg.editable ? loadingMsg.edit(doneText) : this.send(doneText)
			)),
			response,
		];
	}

	// Awaiting responses

	async ask(this: ExtChannel, user: KlasaUser, content: string, options?: MessageOptions): Promise<KlasaMessage> {
		const message = scalarOrFirst(await this.sendMessage(content, options));
		return (
			!(this instanceof TextChannel) || this.permissionsFor(this.guild.me!)!.has('ADD_REACTIONS') ?
				awaitReaction(user, message) :
				awaitMessage(user, this)
		).then(() => message, () => { throw message; });
	}

	async awaitReply(
		this: ExtChannel,
		user: KlasaUser, question: string, time = 60000, embed?: MessageEmbed,
	): Promise<string | false> {
		return this.awaitMsg(user, question, time, embed)
		.then(msg => msg ? msg.content : false);
	}

	async awaitMsg(
		this: ExtChannel,
		user: KlasaUser, question: string, time = 60000, embed?: MessageEmbed,
	): Promise<KlasaMessage | false> {
		await (embed ? this.send(question, { embed }) : this.send(question));
		return (this instanceof KlasaUser ? this.dmChannel : this).awaitMessages(
			message => message.author.id === user.id,
			{ max: 1, time, errors: ['time'] },
		).then(messages => <KlasaMessage>messages.first(), (): false => false);
	}

}

const awaitReaction = async (user: KlasaUser, qMsg: KlasaMessage): Promise<true> => {
	await qMsg.react('🇾');
	await qMsg.react('🇳');
	const data = await qMsg.awaitReactions(
		reaction => reaction.users.has(user.id),
		{ time: 20000, max: 1 },
	);
	qMsg.reactions.removeAll();
	if (data.firstKey() === '🇾') return true;
	throw null;
};

const awaitMessage = async (user: KlasaUser, channel: ExtChannel): Promise<true> => {
	const messages = await (channel instanceof KlasaUser ? channel.dmChannel : channel).awaitMessages(
		mes => mes.author === user,
		{ time: 20000, max: 1 },
	);
	if (messages.size === 0) throw null;
	const responseMessage = await messages.first()!;
	if (responseMessage.content.toLowerCase() === 'yes') return true;
	throw null;
};
