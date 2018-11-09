const assert = require('assert');
const { Message } = require('discord.js');
const { Extendable, util: { isThenable } } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [Message] });
	}

	// Sending responses

	/**
	 * Sends a message that will be editable via command editing (if nothing is attached)
	 * @param {string} key The Language key to send
	 * @param {Array<*>} [localeArgs] The language arguments to pass
	 * @param {Array<*>} [localeResponseArgs] The language response arguments to pass
	 * @param {external:MessageOptions} [options] The D.JS message options plus Language arguments
	 * @returns {Promise<KlasaMessage|KlasaMessage[]>}
	 */
	sendRandom(key, localeArgs = [], localeResponseArgs = [], options = {}) {
		if (!Array.isArray(localeResponseArgs)) {
			if (!Array.isArray(localeArgs)) [options, localeArgs] = [localeArgs, []];
			else [options, localeResponseArgs] = [localeResponseArgs, []];
		}
		const response = this.language.getRandom(key, localeArgs, localeResponseArgs);
		if (isThenable(response)) return response;
		return this.sendMessage(response, options);
	}

	/**
	 * @param {Function} cb The callback function to call in the middle
	 * @param {Object} [options] Extra options
	 * @param {string} [options.loadingText='Just a moment.'] Text to send before the callback
	 * @returns {Promise<KlasaMessage>} Resolves to the return of cb
	 */
	async sendLoading(cb, {
		loadingText = this.language.get('LOADING_TEXT'),
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
		loadingText = this.language.get('LOADING_TEXT'),
		doneText = this.language.get('SENT_IMAGE'),
	} = {}) {
		assert(this.channel.id !== (channel.channel || channel).id);
		await this.send(loadingText);
		// eslint-disable-next-line callback-return
		const response = await cb(channel);
		return [await this.send(doneText), response];
	}

	// Awaiting responses

	async ask(content, options) {
		const message = await this.sendMessage(content, options);
		if (this.channel.permissionsFor(this.guild.me).has('ADD_REACTIONS')) return awaitReaction(this, message);
		return awaitMessage(this);
	}

	async awaitReply(question, time = 60000, embed) {
		return this.awaitMsg(question, time, embed)
			.then(msg => msg.content);
	}

	async awaitMsg(question, time = 60000, embed) {
		await (embed ? this.send(question, { embed }) : this.send(question));
		return this.channel.awaitMessages(message => message.author.id === this.author.id,
			{ max: 1, time, errors: ['time'] })
			.then(messages => messages.first())
			.catch(() => false);
	}

};

const awaitReaction = async (msg, message) => {
	await message.react('🇾');
	await message.react('🇳');
	const data = await message.awaitReactions(reaction => reaction.users.has(msg.author.id), { time: 20000, max: 1 });
	if (data.firstKey() === '🇾') return true;
	throw null;
};

const awaitMessage = async (message) => {
	const messages = await message.channel.awaitMessages(mes => mes.author === message.author, { time: 20000, max: 1 });
	if (messages.size === 0) throw null;
	const responseMessage = await messages.first();
	if (responseMessage.content.toLowerCase() === 'yes') return true;
	throw null;
};
