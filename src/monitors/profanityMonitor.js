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
				this.client.console.log(word);
				assert(profanity.words.includes(word));
				keyValues[word] = (keyValues[word] || msg.author.settings.profanity[word]) + 1;
				assert(!isNaN(keyValues[word]));
			}
		}
		if (Object.keys(keyValues).length) msg.author.settings.update(keyValues);
	}

};
