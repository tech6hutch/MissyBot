const { Monitor } = require('klasa');
const { last } = require('../lib/util/util');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false });

		this.words = ['shit', 'fuck', 'damn', 'bitch', 'crap', 'piss', 'dick', 'darn', 'cock', 'pussy', 'asshole', 'fag', 'bastard', 'slut', 'douche'];
		this.regex = new RegExp(`\\b(?:${[
			...this.words,
			// "pissing"
			...this.words.map(w => `${w}ing`),
			// "crapping"
			...this.words.map(w => `${w}${last(w)}ing`),
			// "damned"
			...this.words.map(w => w + (last(w) === 'e' ? 'd' : 'ed')),
			// "crapped"
			...this.words.map(w => `${w}${last(w)}ed`),
		].join('|')}\\b)`, 'i');
	}

	async run(msg) {
		const swears = msg.content.split(this.regex).length - 1;
		if (swears) msg.author.settings.update('profanity', msg.author.settings.profanity + swears);
	}

};
