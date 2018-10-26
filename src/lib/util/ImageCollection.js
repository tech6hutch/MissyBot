const { join } = require('path');
const { Collection } = require('discord.js');

const makeDJSFileOption = filename => ({
	attachment: join(process.cwd(), 'assets', filename),
	name: filename,
});

class ImageCollection extends Collection {

	constructor(iterable) {
		if (Array.isArray(iterable) && typeof iterable[0] === 'string') {
			iterable = iterable.map(key => [key, makeDJSFileOption(key)]);
		}
		super(iterable);
	}

	get(key) {
		return super.get(key) || this.find((_, k) => k.startsWith(key));
	}

	set(
		key,
		value = this.constructor.makeDJSFileOption(key)
	) {
		return super.set(key, value);
	}

}

ImageCollection.makeDJSFileOption = makeDJSFileOption;

module.exports = ImageCollection;
