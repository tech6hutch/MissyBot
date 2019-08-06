import assert, { AssertionError } from 'assert';
import { join } from 'path';
import { readFile } from 'fs-nextra';
import { MessageOptions, FileOptions } from 'discord.js';
import { Piece, PieceOptions, KlasaMessage } from 'klasa';
import AssetStore from './AssetStore';
import { capitalizeFirstLetter } from '../util/util';
import { Sendable } from '../util/types';

export interface AssetOptions extends PieceOptions {
	/** The display title; defaults to the name, spaced and capitalized */
	title?: string;
	/** A caption for the asset */
	caption?: string;
	/** The path to the actual asset (without its name) */
	assetPath?: string;
	/** The name of the actual asset; defaults to the name + '.png' */
	assetName?: string;
}

/**
 * Base class for all Assets.
 * @extends {Piece}
 */
class Asset extends Piece {

	title: string;

	caption: string;

	/** The full category for the asset */
	fullCategory: string[];

	assetPath: string;
	assetName: string;

	buffer: Buffer | null;
	assetLoaded: Promise<void>;

	/**
	 * @param store The Asset store
	 * @param file The path from the pieces folder to the asset JS file
	 * @param directory The base directory to the pieces folder
	 * @param options Optional Asset settings
	 */
	constructor(store: AssetStore, file: string[], directory: string, options: AssetOptions = {}) {
		super(store, file, directory, options);

		this.title = options.title || this.name
			.split('-')
			.map(word => capitalizeFirstLetter(word))
			.join(' ');

		this.caption = options.caption || '';

		this.fullCategory = file.slice(0, -1);

		this.assetPath = options.assetPath || '';
		this.assetName = options.assetName || `${this.name}.png`;

		this.buffer = null;
		this.assetLoaded = this.loadAsset();
	}

	/**
	 * The main category for the asset
	 */
	get category(): string {
		return this.fullCategory[0] || 'General';
	}

	/**
	 * The sub category for the asset
	 */
	get subCategory(): string {
		return this.fullCategory[1] || 'General';
	}

	get fileOption(): FileOptions {
		if (!this.buffer) throw new AssertionError();
		return {
			attachment: this.buffer,
			name: this.assetName,
		};
	}

	async uploadTo(channel: Sendable, messageOptions: MessageOptions = {}, { caption = this.caption } = {}) {
		return channel.send(caption, {
			...messageOptions,
			files: [this.fileOption],
		}) as Promise<KlasaMessage | KlasaMessage[]>;
	}

	async loadAsset() {
		this.buffer = await readFile(join(this.client.userBaseDirectory, '..', 'assets', this.assetPath, this.assetName));
	}

	async init() {
		await this.assetLoaded;
		assert(this.buffer);
	}

	static extend(options: AssetOptions = {}) {
		return class extends Asset {

			constructor(store: AssetStore, file: string[], directory: string) {
				super(store, file, directory, options);
			}

		};
	}

}

export default Asset;
