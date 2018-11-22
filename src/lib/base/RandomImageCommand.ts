import assert from 'assert';
import { Command, CommandStore, CommandOptions, Language, KlasaMessage } from 'klasa';
import { arrayRandom, fuzzySearch, resolveLang } from '../util/util';
import MissyClient from '../MissyClient';
import { Sendable } from '../util/types';

export interface RandomImageCommandOptions extends CommandOptions {
	images: string[];
	loadingTextFn?: (lang: Language) => string;
}

class RandomImageCommand extends Command {

	images: string[];
	loadingTextFn: (lang: Language) => string;

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string, options: RandomImageCommandOptions) {
		super(client, store, file, directory, options);

		if (!Array.isArray(options.images)) throw new TypeError('options.images must be an array of strings and/or string arrays');
		this.images = options.images;
		this.loadingTextFn = options.loadingTextFn || (lang => lang.get('LOADING_TEXT'));
	}

	run(msg: KlasaMessage, [firstParam]: [string]) {
		return this.listIfList(msg, firstParam) || this.postIfName(msg, firstParam) || this.postRandom(msg);
	}

	listIfList(channel: Sendable, imageName: string) {
		return imageName === 'list' ?
			channel.send(this.images
				.map(img => this.client.assets.get(img).title)
				.join('\n')) :
			null;
	}

	postIfName(channel: Sendable, imageName: string) {
		return imageName ?
			channel.sendLoading(
				() => this.getInFuzzily(imageName).uploadTo(channel),
				{ loadingText: this.loadingTextFn(resolveLang(channel)) }
			) :
			null;
	}

	postRandom(channel: Sendable) {
		return channel.sendLoading(
			() => this.get().uploadTo(channel),
			{ loadingText: this.loadingTextFn(resolveLang(channel)) }
		);
	}

	init() {
		for (const imageName of this.images) {
			assert(this.client.assets.has(imageName));
		}
	}

	/**
	 * Gets a random image from this[key]
	 * @param {string} [key='images'] The property to get from
	 * @returns {Asset}
	 */
	get(key = 'images') {
		return this.client.assets.get(arrayRandom(this[key]));
	}

	/**
	 * Gets a random image's name from this[key]
	 * @param {string} [key='images'] The property to get from
	 * @returns {string}
	 */
	getName(key = 'images') {
		return arrayRandom(this[key]);
	}

	/**
	 * Gets the image at collKey from this[key]
	 * @param {string} name The key in this[key] to get from
	 * @param {string} [key='images'] The property to get from
	 * @returns {Asset}
	 */
	getIn(name, key = 'images') {
		if (!this[key].includes(name)) throw new TypeError('Invalid image name');
		return this.client.assets.get(name);
	}

	/**
	 * Gets the image at collKey from this[key], fuzzily
	 * @param {string} name Something similar to a key in this[key]
	 * @param {string} [key='images'] The property to get from
	 * @returns {Asset}
	 */
	getInFuzzily(name, key = 'images') {
		return this.getIn(fuzzySearch(name, this[key]), key);
	}

}

module.exports = RandomImageCommand;
