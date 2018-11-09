const { Command } = require('klasa');
const { arrayRandom } = require('../util/util');

class RandomImageCommand extends Command {

	constructor(client, store, file, directory, options = {}) {
		super(client, store, file, directory, options);

		if (!Array.isArray(options.images)) throw new TypeError('options.images must be an array of strings and/or string arrays');
		this.images = options.images;
	}

	/**
	 * Gets a random image from this[key]
	 * @param {string} [key="images"] The property to get from
	 * @returns {Asset}
	 */
	get(key = 'images') {
		return this.client.assets.get(arrayRandom(this[key]));
	}

	/**
	 * Gets a random image's name from this[key]
	 * @param {string} [key="images"] The property to get from
	 * @returns {string}
	 */
	getName(key = 'images') {
		return arrayRandom(this[key]);
	}

	/**
	 * Gets the image at collKey from this[key]
	 * @param {string} name The key in this[key] to get from
	 * @param {string} [key="images"] The property to get from
	 * @returns {Asset}
	 */
	getIn(name, key = 'images') {
		if (!this[key].includes(name)) throw new TypeError('Invalid image name');
		return this.client.assets.get(name);
	}

}

module.exports = RandomImageCommand;
