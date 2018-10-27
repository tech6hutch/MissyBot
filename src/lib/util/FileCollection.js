const { join } = require('path');
const { readFile } = require('fs-nextra');
const { Collection } = require('discord.js');

const makeDJSFileOption = async filename => ({
	attachment: await readFile(join(process.cwd(), 'assets', filename)),
	name: filename,
});

class FileCollection extends Collection {

	get(key) {
		return super.get(key) || this.find((_, k) => k.startsWith(key));
	}

	/**
	 * Set a file in the collection
	 * @param {string} filename The file
	 * @returns {Promise<this>}
	 */
	async setFile(filename) {
		return this.set(filename, await makeDJSFileOption(filename));
	}

	/**
	 * Set files in the collection
	 * @param {string[]} filenames The files
	 * @returns {Promise<this>}
	 */
	async setFiles(filenames) {
		await Promise.all(filenames.map(name => this.setFile(name)));
		return this;
	}

}

FileCollection.makeDJSFileOption = makeDJSFileOption;

module.exports = FileCollection;
