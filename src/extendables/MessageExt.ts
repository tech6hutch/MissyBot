import assert from 'assert';
import { Message, MessageOptions, MessageEmbed, TextChannel } from 'discord.js';
import {
	Extendable, util as KlasaUtil,
	KlasaClient, ExtendableStore, Monitor, KlasaMessage,
} from 'klasa';
const { isThenable } = KlasaUtil;
import MissyClient from '../lib/MissyClient';
import { scalarOrFirst } from '../lib/util/util';
import { Language, Sendable, Message as MyMessage } from '../lib/util/types';

module.exports = class extends Extendable {

	constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [Message] });
	}

	// Getters

	get localPrefix(this: Message) {
		const prefix = this.prefixLength ? this.content.slice(0, this.prefixLength) : <string | string[]>this.guildSettings.get('prefix');
		if (this.prefix === (<Monitor & { prefixMention: RegExp }>this.client.monitors.get('commandHandler')).prefixMention) return `@${this.client.user!.tag}`;
		if (Array.isArray(prefix)) return prefix[0];
		if (!prefix.length) return (<MissyClient>this.client).PREFIX;
		return prefix;
	}

	// Sending responses

	/**
	 * Sends a message that will be editable via command editing (if nothing is attached)
	 * @param key The Language key to send
	 * @param localeArgs The language arguments to pass
	 * @param localeResponseArgs The language response arguments to pass
	 * @param options The D.JS message options plus Language arguments
	 */
	sendRandom(this: Message, key: string, localeArgs: any[] = [], localeResponseArgs: any[] = [], options: MessageOptions = {}) {
		if (!Array.isArray(localeResponseArgs)) {
			if (!Array.isArray(localeArgs)) [options, localeArgs] = [localeArgs, []];
			else [options, localeResponseArgs] = [localeResponseArgs, []];
		}
		const response = (<Language>this.language).getRandom(key, localeArgs, localeResponseArgs);
		if (isThenable(response)) return response;
		return this.sendMessage(response, options);
	}

	/**
	 * @param cb The callback function to call in the middle
	 * @param options Extra options
	 * @param options.loadingText Text to send before the callback
	 * @returns Resolves to the return of cb
	 */
	async sendLoading<T = KlasaMessage>(this: Message, cb: (msg: KlasaMessage) => T, {
		loadingText = this.language.get('LOADING_TEXT'),
	} = {}): Promise<T> {
		const loadingMsg = scalarOrFirst(await this.send(loadingText));
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
	async sendLoadingFor<T = KlasaMessage>(this: Message, channel: Sendable, cb: (msg: Sendable) => T, {
		loadingText = this.language.get('LOADING_TEXT'),
		doneText = this.language.get('SENT_IMAGE'),
	} = {}): Promise<[KlasaMessage, T]> {
		assert(this.channel.id !== ((<any>channel).channel || channel).id);
		await this.send(loadingText);
		// eslint-disable-next-line callback-return
		const response = await cb(channel);
		return [scalarOrFirst(await this.send(doneText)), response];
	}

	// Awaiting responses

	async ask(this: Message, content: string, options: MessageOptions): Promise<KlasaMessage> {
		const message = scalarOrFirst(await this.sendMessage(content, options));
		return (
			(<TextChannel>this.channel).permissionsFor(this.guild.me)!.has('ADD_REACTIONS') ?
				awaitReaction(this, message) :
				awaitMessage(this)
		).then(() => message).catch(() => { throw message; });
	}

	async awaitReply(this: MyMessage, question: string, time = 60000, embed?: MessageEmbed): Promise<string | false> {
		return this.awaitMsg(question, time, embed)
			.then(msg => msg.content)
			.catch((): false => false);
	}

	async awaitMsg(this: Message, question: string, time = 60000, embed?: MessageEmbed): Promise<Message> {
		await (embed ? this.send(question, { embed }) : this.send(question));
		return await this.channel.awaitMessages(message => message.author.id === this.author.id,
			{ max: 1, time, errors: ['time'] })
			.then(messages => messages.first()!);
	}

};

const awaitReaction = async (msg: Message, message: KlasaMessage) => {
	await message.react('🇾');
	await message.react('🇳');
	const data = await message.awaitReactions(reaction => reaction.users.has(msg.author.id), { time: 20000, max: 1 });
	message.reactions.removeAll();
	if (data.firstKey() === '🇾') return true;
	throw null;
};

const awaitMessage = async (message: Message) => {
	const messages = await message.channel.awaitMessages(mes => mes.author === message.author, { time: 20000, max: 1 });
	if (messages.size === 0) throw null;
	const responseMessage = await messages.first()!;
	if (responseMessage.content.toLowerCase() === 'yes') return true;
	throw null;
};
