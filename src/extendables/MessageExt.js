const { Message } = require('discord.js');
const { Extendable } = require('klasa');
const { arrayRandom } = require('../lib/util/util');

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
		const response = arrayRandom(this.language.get(key, ...localeArgs));
		return this.sendMessage(typeof response === 'function' ? response(...localeResponseArgs) : response, options);
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
