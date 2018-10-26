/* eslint-disable valid-jsdoc */

const { Command } = require('klasa');
const ImageCollection = require('../util/ImageCollection');
const { postImage, postImageSomewhere } = require('../util/util');

class RandomImageCommand extends Command {

	constructor(client, store, file, directory, options = {}) {
		super(client, store, file, directory, options);

		if (!Array.isArray(options.images)) throw new TypeError('options.images must be an array of strings');
		this.images = new ImageCollection(options.images);
	}

	/**
	 * Gets a random image from this[key]
	 * @param {string} [key="images"] The property to get from
	 * @returns {{attachment: string, name: string}}
	 */
	get(key = 'images') {
		return this[key].random();
	}

	/**
	 * Gets a random image's name from this[key]
	 * @param {string} [key="images"] The property to get from
	 * @returns {string}
	 */
	getName(key = 'images') {
		return this[key].randomKey();
	}

	/**
	 * Gets the image at collKey from this[key]
	 * @param {string} name The key in this[key] to get from
	 * @param {string} [key="images"] The property to get from
	 * @returns {{attachment: string, name: string}}
	 */
	getIn(name, key = 'images') {
		return this[key].get(name);
	}

	/**
	 * Send a random image from this[key]
	 * @param {TextChannel|KlasaMessage} channel
	 * @param {string|[string, string]} [key="images"] If array, same order as this.getIn
	 * @param {Object} [postImageOptions={}]
	 * @returns {Promise<KlasaMessage>}
	 * @throws {false} If image not found
	 */
	async sendTo(channel, key, postImageOptions) {
		const image = Array.isArray(key) ? this.getIn(key[0], key[1]) : this.get(key);
		if (!image) throw null;
		return postImage(channel, image, postImageOptions);
	}

	/**
	 * Send a random image from this[key] to...somewhere
	 * @param {TextChannel|KlasaMessage} fromChannel
	 * @param {TextChannel|KlasaMessage} toChannel
	 * @param {string|[string, string]} [key="images"] If array, same order as this.getIn
	 * @param {Object} [postImageSomewhereOptions={}]
	 * @returns {Promise<[KlasaMessage, KlasaMessage]>}
	 * @throws {false} If image not found
	 */
	async sendFromTo(fromChannel, toChannel, key, postImageSomewhereOptions) {
		return postImageSomewhere(fromChannel, toChannel,
			this._get(key),
			postImageSomewhereOptions);
	}

	_get(key) {
		const image = Array.isArray(key) ? this.getIn(key[0], key[1]) : this.get(key);
		if (image) return image;
		throw false;
	}

}

RandomImageCommand.ImageCollection = ImageCollection;

module.exports = RandomImageCommand;
