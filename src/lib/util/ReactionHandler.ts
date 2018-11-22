// Based on Klasa's, but modified to be more generic. Original is: Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.

import {
	ReactionCollector,
	CollectorFilter, MessageReaction, Message,
} from 'discord.js';
import { KlasaUser } from 'klasa';
import IconifiedDisplay from './IconifiedDisplay';
import { sleep } from './util';
import { AnyObj } from './types';

export type SpamLimit = { warn: number, stop: number };

export interface ReactionHandlerOptions {
	/** A filter function to add to the ReactionHandler */
	filter?: Function;
	/** The maximum total amount of reactions to collect */
	max?: number;
	/** The maximum number of emojis to collect */
	maxEmojis?: number;
	/** The maximum number of users to react */
	maxUsers?: number;
	/** If a stop reaction should be included */
	stop?: boolean;
	/** The number of page changes to be pending before warning or stopping */
	spamLimit?: SpamLimit;
}

/** A single unicode character */
export type Emoji = string;

/**
 * My ReactionHandler, for handling reaction input for rich embed displays/menus
 */
export default class ReactionHandler extends ReactionCollector {

	/** The rich embed display/menu that this handler is for */
	display: IconifiedDisplay;

	/** An emoji to method map, to map custom emojis to static method names */
	methodMap: Map<string, Emoji>;

	/** Whether the menu is awaiting a response of a prompt, to block all other jump reactions */
	awaiting: boolean;

	/** Whether reactions have finished queuing (used to handle clearing reactions on early menu selections) */
	reactionsDone: boolean;

	/** Used to ignore reactions when users spam them */
	collectionQueue: Array<object>;

	/** The number of page changes to be pending before warning or stopping */
	spamLimit: SpamLimit;

	/**
	 * Constructs our ReactionHandler instance
	 * @param message A message this ReactionHandler should handle reactions
	 * @param filter A filter function to determine which emoji reactions should be handled
	 * @param options The options for this ReactionHandler
	 * @param display The rich embed display/menu that this handler is for
	 * @param emojis The emojis which should be used in this handler
	 */
	constructor(message: Message, filter: CollectorFilter, options: ReactionHandlerOptions, display: IconifiedDisplay, emojis: Emoji[] = Object.values(display.emojis)) {
		super(message, filter, options);

		this.display = display;

		this.methodMap = new Map(Object.entries(this.display.emojis).map(([key, value]): [string, string] => [value, key]));

		this.awaiting = false;

		this.reactionsDone = false;

		this.collectionQueue = [];

		this.spamLimit = options.spamLimit || { warn: Infinity, stop: Infinity };

		if (emojis.length) {
			this._queueEmojiReactions(emojis.slice());
		} else {
			this.stop();
			return;
		}

		this.on('collect', (reaction, user) => {
			this.onCollect(reaction, user);
		});
		this.on('end', () => {
			this.onEnd();
		});
	}

	/**
	 * Called whenever a reaction is collected
	 * @param reaction The reaction that was collected
	 * @param user The user that added the reaction
	 */
	onCollect(reaction: MessageReaction, user: KlasaUser): void {
		const { collectionQueue: collQ } = this;

		if (collQ.length >= this.spamLimit.warn && reaction.emoji.name !== '⏹') {
			if (collQ.length >= this.spamLimit.stop) {
				this.message.channel.sendLocale('REACTIONHANDLER_SPAM_STOP');
				this.stop();
				return;
			}

			// If this promise fails, the bot didn't have perms to remove others' reactions :/
			const reactionPromise = reaction.users.remove(user).catch(() => null);
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

		// If this promise fails, the bot didn't have perms to remove others' reactions :/
		const reactionPromise = reaction.users.remove(user).catch(() => null);
		const methodPromise = Promise.resolve((<AnyObj>this)[this.methodMap.get(reaction.emoji.name)!](user));
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
	 */
	async onEnd(): Promise<void> {
		if (this.reactionsDone && !this.message.deleted) {
			try {
				// If this promise fails, the bot didn't have perms to remove others' reactions :/
				await this.message.reactions.removeAll();
			} catch (_) {
				for (const reaction of this.message.reactions.values()) {
					if (reaction.me) reaction.users.remove();
				}
			}
		}
	}

	/**
	 * The action to take when the "info" emoji is reacted
	 */
	info(): Promise<Message> {
		return this.message.edit(this.display.pages.info);
	}

	/**
	 * The action to take when the "stop" emoji is reacted
	 */
	stop(): void {
		super.stop();
	}

	/**
	 * The action to take when the "first" emoji is reacted
	 * @param emojis The remaining emojis to react
	 */
	private async _queueEmojiReactions(emojis: Emoji[]): Promise<null | any> {
		if (this.message.deleted) return this.stop();
		if (this.ended) return this.message.reactions.removeAll();
		await this.message.react(emojis.shift()!);
		if (emojis.length) return this._queueEmojiReactions(emojis);
		this.reactionsDone = true;
		return null;
	}

}
