const assert = require('assert');
const { Monitor } = require('klasa');
const profanity = require('../lib/profanity');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false });
	}

	async run(msg) {
		const keyValues = {};
		let swears;
		while ((swears = profanity.regex.exec(msg.content)) !== null) {
			for (const [i, word] of swears.entries()) {
				if (!(i && word)) continue;
				assert(profanity.words.includes(word));
				keyValues[word] = (keyValues[word] || msg.author.settings.profanity[word]) + 1;
				assert(!isNaN(keyValues[word]));
			}
		}
		this.client.console.log(keyValues);
		if (Object.keys(keyValues).length) msg.author.settings.update(keyValues);
	}

};
