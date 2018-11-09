const assert = require('assert');
const { join } = require('path');
const { readFile } = require('fs-nextra');
const { Piece } = require('klasa');
const { capitalizeFirstLetter } = require('../util/util');

/**
 * Base class for all Assets.
 * @extends {Piece}
 */
class Asset extends Piece {

	/**
	 * @typedef {PieceOptions} AssetOptions
	 * @property {string} [title] The display title; defaults to the name, spaced and capitalized
	 * @property {string} [caption=''] A caption for the asset
	 * @property {string} [assetPath=''] The path to the actual asset (without its name)
	 * @property {string} [assetName] The name of the actual asset; defaults to the name + '.png'
	 */

	/**
	 * @param {MissyClient} client The Klasa Client
	 * @param {AssetStore} store The Asset store
	 * @param {Array} file The path from the pieces folder to the asset JS file
	 * @param {string} directory The base directory to the pieces folder
	 * @param {AssetOptions} [options={}] Optional Asset settings
	 */
	constructor(client, store, file, directory, options = {}) {
		super(client, store, file, directory, options);

		this.title = options.title || this.name
			.split('-')
			.map(word => capitalizeFirstLetter(word))
			.join(' ');

		this.caption = options.caption || '';

		/**
		 * The full category for the asset
		 * @type {string[]}
		 */
		this.fullCategory = file.slice(0, -1);

		this.assetPath = options.assetPath || '';
		this.assetName = options.assetName || `${this.name}.png`;

		this.buffer = null;
		this.assetLoaded = this.loadAsset();
	}

	/**
	 * The main category for the asset
	 * @type {string}
	 * @readonly
	 */
	get category() {
		return this.fullCategory[0] || 'General';
	}

	/**
	 * The sub category for the asset
	 * @type {string}
	 * @readonly
	 */
	get subCategory() {
		return this.fullCategory[1] || 'General';
	}

	get fileOption() {
		return {
			attachment: this.buffer,
			name: this.assetName,
		};
	}

	async uploadTo(channel, messageOptions = {}, { caption = this.caption } = {}) {
		return channel.send(caption, {
			...messageOptions,
			files: [this.fileOption],
		});
	}

	async loadAsset() {
		this.buffer = await readFile(join(this.client.userBaseDirectory, '..', 'assets', this.assetPath, this.assetName));
	}

	async init() {
		await this.assetLoaded;
		assert(this.buffer);
	}

	static extend(options = {}) {
		return class extends Asset {

			constructor(...args) {
				super(...args, options);
			}

		};
	}

}

module.exports = Asset;
