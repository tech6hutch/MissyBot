// Based on Klasa's, but modified to be more generic. Original is: Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.

const { ReactionCollector } = require('discord.js');
const { util: { sleep } } = require('klasa');

/**
 * My ReactionHandler, for handling reaction input for rich embed displays/menus
 * @extends ReactionCollector
 */
class ReactionHandler extends ReactionCollector {

	/**
	 * A single unicode character
	 * @typedef {string} Emoji
	 */

	/**
	 * @typedef {Object} ReactionHandlerOptions
	 * @property {Function} [filter] A filter function to add to the ReactionHandler
	 * @property {boolean} [stop=true] If a stop reaction should be included
	 * @property {number} [max] The maximum total amount of reactions to collect
	 * @property {number} [maxEmojis] The maximum number of emojis to collect
	 * @property {number} [maxUsers] The maximum number of users to react
	 * @property {number} [time] The maximum amount of time before this RichMenu should expire
	 * @property {{warn: number, stop: number}} [spamLimit=Infinity] The number of page changes to be pending before warning or stopping
	 */

	/**
	 * Constructs our ReactionHandler instance
	 * @param {KlasaMessage} message A message this ReactionHandler should handle reactions
	 * @param {Function} filter A filter function to determine which emoji reactions should be handled
	 * @param {ReactionHandlerOptions} options The options for this ReactionHandler
	 * @param {(RichDisplay|RichMenu)} display The RichDisplay or RichMenu that this handler is for
	 * @param {Emoji[]} [emojis=Object.values(display.emojis)] The emojis which should be used in this handler
	 */
	constructor(message, filter, options, display, emojis = Object.values(display.emojis)) {
		super(message, filter, options);

		/**
		 * The display/menu this Handler is for
		 * @type {(RichDisplay|RichMenu)}
		 */
		this.display = display;

		/**
		 * An emoji to method map, to map custom emojis to static method names
		 * @type {Map<string, Emoji>}
		 */
		this.methodMap = new Map(Object.entries(this.display.emojis).map(([key, value]) => [value, key]));

		/**
		 * Whether the menu is awaiting a response of a prompt, to block all other jump reactions
		 * @type {boolean}
		 */
		this.awaiting = false;

		/**
		 * Whether reactions have finished queuing (used to handle clearing reactions on early menu selections)
		 * @type {boolean}
		 */
		this.reactionsDone = false;

		/**
		 * Used to ignore reactions when users spam them
		 * @type {Array<object>}
		 */
		this.collectionQueue = [];

		/**
		 * The number of page changes to be pending before warning or stopping
		 * @type {{warn: number, stop: number}}
		 */
		this.spamLimit = options.spamLimit || { warn: Infinity, stop: Infinity };

		if (emojis.length) this._queueEmojiReactions(emojis.slice());
		else return this.stop();

		this.on('collect', (reaction, user) => {
			this.onCollect(reaction, user);
		});
		this.on('end', () => {
			this.onEnd();
		});
	}

	/**
	 * Called whenever a reaction is collected
	 * @param {MessageReaction} reaction The reaction that was collected
	 * @param {KlasaUser} user The user that added the reaction
	 * @returns {void}
	 */
	onCollect(reaction, user) {
		const { collectionQueue: collQ } = this;

		if (collQ.length >= this.spamLimit.warn && reaction.emoji.name !== '⏹') {
			if (collQ.length >= this.spamLimit.stop) {
				this.message.channel.sendLocale('REACTIONHANDLER_SPAM_STOP');
				this.stop();
				return;
			}

			const reactionPromise = reaction.users.remove(user);
			if (collQ.length === this.spamLimit.warn) {
				this.message.channel.sendLocale('REACTIONHANDLER_SPAM_WARN');
			}
			const obj = { reactionPromise };
			Promise.all([reactionPromise, sleep(2000)])
				.then(() => {
					const index = collQ.findIndex(queued => queued === obj);
					if (index > -1) collQ.splice(index, 1);
					else this.client.console.error('I guess this was already removed?');
				});
			collQ.push(obj);
			return;
		}

		const reactionPromise = reaction.users.remove(user);
		const methodPromise = Promise.resolve(this[this.methodMap.get(reaction.emoji.name)](user));
		const obj = { reactionPromise, methodPromise };
		Promise.all([reactionPromise, methodPromise, sleep(1000)])
			.then(() => {
				const index = collQ.findIndex(queued => queued === obj);
				if (index > -1) collQ.splice(index, 1);
				else this.client.console.error('I guess this was already removed?');
			});
		collQ.push(obj);
	}

	/**
	 * Called when the collector is finished collecting
	 * @returns {void}
	 */
	onEnd() {
		if (this.reactionsDone && !this.message.deleted) this.message.reactions.removeAll();
	}

	/**
	 * The action to take when the "info" emoji is reacted
	 * @returns {Promise<KlasaMessage>}
	 */
	info() {
		return this.message.edit(this.display.pages.info);
	}

	/**
	 * The action to take when the "stop" emoji is reacted
	 * @returns {void}
	 */
	stop() {
		super.stop();
	}

	/**
	 * The action to take when the "first" emoji is reacted
	 * @param {Emoji[]} emojis The remaining emojis to react
	 * @returns {null}
	 * @private
	 */
	async _queueEmojiReactions(emojis) {
		if (this.message.deleted) return this.stop();
		if (this.ended) return this.message.reactions.removeAll();
		await this.message.react(emojis.shift());
		if (emojis.length) return this._queueEmojiReactions(emojis);
		this.reactionsDone = true;
		return null;
	}

}

module.exports = ReactionHandler;
