import { MessageOptions, MessageEmbed, TextChannel, Message, Snowflake } from 'discord.js';
import { Extendable, ExtendableStore, Monitor } from 'klasa';
import MissyClient from '../lib/MissyClient';
import { scalarOrFirst } from '../lib/util/util';
import { Sendable, MissySendAliases } from '../lib/util/types';

declare module 'discord.js' {
	export interface Message extends MissySendAliases {
		readonly client: MissyClient;

		readonly localPrefix: string;

		ask(this: Message, content: string, options?: MessageOptions): Promise<Message>;
		awaitReply(this: Message, question: string, time?: number, embed?: MessageEmbed):
			Promise<string | false>;
		awaitMsg(this: Message, question: string, time?: number, embed?: MessageEmbed):
			Promise<Message | false>;
	}
}

export default class extends Extendable {

	constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	// Getters

	get localPrefix(this: Message): string {
		const prefix = this.prefixLength ? this.content.slice(0, this.prefixLength) : <string | string[]>this.guildSettings.get('prefix');
		if (this.prefix === (<Monitor & { prefixMention: RegExp }>this.client.monitors.get('commandHandler')).prefixMention) return `@${this.client.user!.tag}`;
		if (Array.isArray(prefix)) return prefix[0];
		if (!prefix.length) return this.client.PREFIX;
		return prefix;
	}

	// Sending responses

	/**
	 * @param cb The callback function to call in the middle
	 * @param options Extra options
	 * @param options.loadingText Text to send before the callback
	 * @returns Resolves to the return of cb
	 */
	async sendLoading<T = Message>(this: Message, cb: (msg: Message) => T, {
		loadingText = this.language.get('LOADING_TEXT'),
	} = {}): Promise<T> {
		const loadingMsg = scalarOrFirst(await this.sendMessage(loadingText));
		const oldContent = loadingMsg.content;
		// eslint-disable-next-line callback-return
		const response = await cb(loadingMsg);
		// If the message was edited in cb, we don't wanna delete it
		if (!(response && (<any>response).id === loadingMsg.id) && oldContent === loadingMsg.content) await loadingMsg.delete();
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
	async sendLoadingFor<T = Message>(this: Message, channel: Sendable, cb: (msg: Sendable) => T, {
		loadingText = this.language.get('LOADING_TEXT'),
		doneText = this.language.get('SENT_IMAGE'),
	} = {}): Promise<[Message, T]> {
		await this.send(loadingText);
		// eslint-disable-next-line callback-return
		const response = await cb(channel);
		return [scalarOrFirst(await this.send(doneText)), response];
	}

	// Awaiting responses

	async ask(this: Message, content: string, options?: MessageOptions): Promise<Message> {
		const message = scalarOrFirst(await this.sendMessage(content, options));
		return (
			!(this.channel instanceof TextChannel) || this.channel.permissionsFor(this.channel.guild.me!)!.has('ADD_REACTIONS') ?
				awaitReaction(this, message) :
				awaitMessage(this)
		).then(() => message, () => { throw message; });
	}

	async awaitReply(
		this: Message,
		question: string, time = 60000, embed?: MessageEmbed,
	): Promise<string | false> {
		return this.awaitMsg(question, time, embed)
			.then(msg => msg ? msg.content : false);
	}

	async awaitMsg(
		this: Message,
		question: string, time = 60000, embed?: MessageEmbed,
	): Promise<Message | false> {
		await (embed ? this.send(question, { embed }) : this.send(question));
		return await this.channel.awaitMessages(
			message => message.author.id === this.author!.id,
			{ max: 1, time, errors: ['time'] }
		).then(messages => <Message>messages.first(), (): false => false);
	}

	// Misc.

	async unreact(this: Message, emojiID: Snowflake) {
		const reaction = this.reactions.get(emojiID);
		return reaction ? reaction.users.remove(this.client.user!) : null;
	}

}

const awaitReaction = async (initialMsg: Message, qMsg: Message): Promise<true> => {
	await qMsg.react('🇾');
	await qMsg.react('🇳');
	const data = await qMsg.awaitReactions(
		reaction => reaction.users.has(initialMsg.author!.id),
		{ time: 20000, max: 1 },
	);
	qMsg.reactions.removeAll();
	if (data.firstKey() === '🇾') return true;
	throw null;
};

const awaitMessage = async (initialMsg: Message): Promise<true> => {
	const messages = await initialMsg.channel.awaitMessages(
		mes => mes.author === initialMsg.author,
		{ time: 20000, max: 1 },
	);
	if (messages.size === 0) throw null;
	const responseMessage = await messages.first()!;
	if (responseMessage.content.toLowerCase() === 'yes') return true;
	throw null;
};
