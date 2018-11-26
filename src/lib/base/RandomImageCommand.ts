import assert from 'assert';
import { CommandStore, Language, KlasaMessage } from 'klasa';
import { arrayRandom, fuzzySearch, resolveLang } from '../util/util';
import MissyClient from '../MissyClient';
import MissyCommand, { MissyCommandOptions } from '../structures/MissyCommand';
import { Sendable, IndexedObj, AnyObj } from '../util/types';
import Asset from '../structures/Asset';

export interface RandomImageCommandOptions extends MissyCommandOptions {
	images: string[];
	loadingTextFn?: (lang: Language) => string;
}

export default class RandomImageCommand extends MissyCommand {

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

	listIfList(channel: Sendable, imageName: string | undefined) {
		return imageName === 'list' ?
			channel.send(this.images
				.map(img => this.client.assets.get(img).title)
				.join('\n')) as Promise<KlasaMessage | KlasaMessage[]> :
			null;
	}

	postIfName(channel: Sendable, imageName: string | undefined) {
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

	async init() {
		for (const imageName of this.images) {
			assert(this.client.assets.has(imageName));
		}
	}

	/**
	 * Gets a random image from this[key]
	 * @param key The property to get from
	 */
	get(key = 'images'): Asset {
		return this.client.assets.get(arrayRandom((<AnyObj>this)[key]));
	}

	/**
	 * Gets a random image's name from this[key]
	 * @param key The property to get from
	 */
	getName(key = 'images'): string {
		return arrayRandom((<AnyObj>this)[key]);
	}

	/**
	 * Gets the image at collKey from this[key]
	 * @param name The key in this[key] to get from
	 * @param key The property to get from
	 */
	getIn(name: string, key = 'images'): Asset {
		if (!(<AnyObj>this)[key].includes(name)) throw new TypeError('Invalid image name');
		return this.client.assets.get(name);
	}

	/**
	 * Gets the image at collKey from this[key], fuzzily
	 * @param name Something similar to a key in this[key]
	 * @param key The property to get from
	 */
	getInFuzzily(name: string, key = 'images'): Asset {
		return this.getIn(fuzzySearch(name, (<AnyObj>this)[key]), key);
	}

}
