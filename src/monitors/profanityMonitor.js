const assert = require('assert');
const { Monitor } = require('klasa');
const profanity = require('../lib/profanity');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false });
	}

	async run(msg) {
		const obj = { profanity: {} };
		const keyValues = obj.profanity;
		let swears;
		while ((swears = profanity.regex.exec(msg.content)) !== null) {
			for (const [i, word] of swears.entries()) {
				if (!(i && word)) continue;
				const unAliasedWord = profanity.get(unAliasedWord);
				assert(profanity.words.includes(unAliasedWord), `Unknown word: ${unAliasedWord}`);
				keyValues[unAliasedWord] = (keyValues[unAliasedWord] || msg.author.settings.profanity[unAliasedWord]) + 1;
				assert(!isNaN(keyValues[unAliasedWord]));
			}
		}
		if (Object.keys(keyValues).length) msg.author.settings.update(obj);
	}

};
