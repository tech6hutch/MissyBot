const assert = require('assert');
const { TextChannel, DMChannel, GroupDMChannel, User } = require('discord.js');
const { Extendable, util: { isThenable } } = require('klasa');
const { resolveLang } = require('../lib/util/util');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [TextChannel, DMChannel, GroupDMChannel, User] });
	}

	// Sending responses

	sendRandom(key, args = [], responseArgs = [], options = {}) {
		if (!Array.isArray(responseArgs)) {
			if (!Array.isArray(args)) [options, args] = [args, []];
			else [options, responseArgs] = [responseArgs, []];
		}
		const response = resolveLang(this).getRandom(key, args, responseArgs);
		if (isThenable(response)) return response;
		return this.send({ content: response, ...options });
	}

	/**
	 * @param {Function} cb The callback function to call in the middle
	 * @param {Object} [options] Extra options
	 * @param {string} [options.loadingText='Just a moment.'] Text to send before the callback
	 * @returns {Promise<KlasaMessage>} Resolves to the return of cb
	 */
	async sendLoading(cb, {
		loadingText = resolveLang(this).get('LOADING_TEXT'),
	} = {}) {
		const loadingMsg = await this.send(loadingText);
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
	async sendLoadingFor(channel, cb, {
		loadingText = resolveLang(this).get('LOADING_TEXT'),
		doneText = resolveLang(this).get('SENT_IMAGE'),
	} = {}) {
		assert(this.channel.id !== (channel.channel || channel).id);
		const loadingMsg = await this.send(loadingText);
		// eslint-disable-next-line callback-return
		const response = await cb(channel);
		return [await (loadingMsg.editable ? loadingMsg.edit(doneText) : this.send(doneText)), response];
	}

	// Awaiting responses

	async ask(user, content, options) {
		const message = await this.sendMessage(content, options);
		return (
			this.permissionsFor(this.guild.me).has('ADD_REACTIONS') ?
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

};

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
