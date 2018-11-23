import assert from 'assert';
import {
	TextChannel, DMChannel, GroupDMChannel,
	MessageOptions,
} from 'discord.js';
import {
	Extendable, KlasaUser,
	ExtendableStore, KlasaMessage,
} from 'klasa';
import MissyClient from '../lib/MissyClient';
import { scalarOrFirst, resolveLang } from '../lib/util/util';
import { Sendable, MissySendAliases } from '../lib/util/types';

type ExtChannel = TextChannel | DMChannel | GroupDMChannel | KlasaUser;

declare module 'klasa' {
	interface ExtChannelAskMethods {
		ask(user: KlasaUser, content: string, options?: MessageOptions): Promise<KlasaMessage>;
	}

	export interface TextChannel extends MissySendAliases, ExtChannelAskMethods {}
	export interface DMChannel extends MissySendAliases, ExtChannelAskMethods {}
	export interface GroupDMChannel extends MissySendAliases, ExtChannelAskMethods {}
	export interface KlasaUser extends MissySendAliases, ExtChannelAskMethods {}
}

export default class extends Extendable {

	constructor(client: MissyClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [TextChannel, DMChannel, GroupDMChannel, KlasaUser] });
	}

	// Sending responses

	sendRandom(
		this: ExtChannel,
		key: string, localeArgs: any[] = [], localeResponseArgs: any[] = [], options: MessageOptions = {},
	): Promise<KlasaMessage | KlasaMessage[]> {
		if (!Array.isArray(localeResponseArgs)) {
			if (!Array.isArray(localeArgs)) [options, localeArgs] = [localeArgs, []];
			else [options, localeResponseArgs] = [localeResponseArgs, []];
		}
		const response = resolveLang(this).getRandom(key, localeArgs, localeResponseArgs);
		assert(typeof response === 'string');
		return this.sendMessage(response, options);
	}

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
	 * @param {(KlasaMessage|TextChannel)} channel The channel you intend to post in
	 * @param {Function} cb The callback function to call in the middle
	 * @param {Object} [options] Extra options
	 * @param {string} [options.loadingText='Just a moment.'] Text to send to this.channel before the callback
	 * @param {string} [options.doneText='Sent the image 👌'] Text to send to this.channel after the callback
	 * @returns {Promise<[KlasaMessage, KlasaMessage]>} Resolves to a confirmation message in this.channel and the return of cb
	 */
	async sendLoadingFor<T = KlasaMessage>(this: ExtChannel, channel: Sendable, cb: (msg: Sendable) => T, {
		loadingText = resolveLang(this).get('LOADING_TEXT'),
		doneText = resolveLang(this).get('SENT_IMAGE'),
	} = {}): Promise<[KlasaMessage, T]> {
		const loadingMsg = scalarOrFirst(await this.sendMessage(loadingText));
		// eslint-disable-next-line callback-return
		const response = await cb(channel);
		return [
			scalarOrFirst(<KlasaMessage | KlasaMessage[]>await (loadingMsg.editable ? loadingMsg.edit(doneText) : this.send(doneText))),
			response,
		];
	}

	// Awaiting responses

	async ask(this: ExtChannel, user: KlasaUser, content: string, options?: MessageOptions): Promise<KlasaMessage> {
		const message = scalarOrFirst(await this.sendMessage(content, options));
		return (
			!(this instanceof TextChannel) || this.permissionsFor(this.guild.me)!.has('ADD_REACTIONS') ?
				awaitReaction(user, message) :
				awaitMessage(user, this)
		).then(() => message).catch(() => { throw message; });
	}

	async awaitReply(user, question, time = 60000, embed) {
		return this.awaitMsg(user, question, time, embed)
			.then(msg => msg.content);
	}

	async awaitMsg(user, question, time = 60000, embed) {
		await (embed ? this.send(question, { embed }) : this.send(question));
		return this.awaitMessages(message => message.author.id === user.id,
			{ max: 1, time, errors: ['time'] })
			.then(messages => messages.first())
			.catch(() => false);
	}

}

const awaitReaction = async (user, message) => {
	await message.react('🇾');
	await message.react('🇳');
	const data = await message.awaitReactions(reaction => reaction.users.has(user.id), { time: 20000, max: 1 });
	message.reactions.removeAll();
	if (data.firstKey() === '🇾') return true;
	throw null;
};

const awaitMessage = async (user, channel) => {
	const messages = await channel.awaitMessages(mes => mes.author === user, { time: 20000, max: 1 });
	if (messages.size === 0) throw null;
	const responseMessage = await messages.first();
	if (responseMessage.content.toLowerCase() === 'yes') return true;
	throw null;
};
