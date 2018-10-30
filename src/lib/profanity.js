const assert = require('assert');

const sEnds = ['s', 'ing', 'ed'];
const sErEnds = [...sEnds, 'ers?'];
const esEnds = ['es', 'ing', 'ed'];
const esErEnds = [...esEnds, 'ers?'];
/**
 * @type {([string, string[]?, string[]?])[]}
 */
const profanityToAssemble = [
	// Excrement
	['shit', ['s', 't?ers?', 't?ing', 't?ed'], ['shat', 'shite']],
	['piss', esErEnds],
	['crap', ['s', 'p?ers?', 'p?ing', 'p?ed']],
	// Body parts
	['cunt', sEnds],
	['cock', sEnds],
	['dick', sEnds],
	['pussy', sEnds, ['pussies', 'pussied']],
	['bollock', ['s']],
	['asshole', ['s']],
	['arsehole', ['s']],
	['ass', esEnds],
	['arse', esEnds],
	// Insults
	['bitch', esEnds],
	['fag', ['s', 'g?ing', 'ged'], ['faggot', 'faggots']],
	['bastard', ['s']],
	['slut', ['s']],
	['douche', ['s'], ['douching', 'douched']],
	// Sexual
	['fuck', sErEnds],
	['bugger', sEnds],
	['wank', sErEnds],
	// General & religious
	['goddamn', ['ed'], ['gdi']],
	['hell'],
	['bloody'],
	['damn', sEnds],
	['darn', ['ed']],
];
for (const array of profanityToAssemble) {
	assert(typeof array[0] === 'string' && array[0].length);
	// eslint-disable-next-line eqeqeq
	assert((Array.isArray(array[1]) && array[1].length) || array[1] == null);
	assert(typeof array[2] === 'undefined' || Array.isArray(array[2]));
	assert([1, 2, 3].includes(array.length));
}

module.exports = new class extends Map {

	constructor() {
		super();

		this.regexes = new Map();

		for (const [word, wordEnds, similarWords = []] of profanityToAssemble) {
			this.set(word, word);
			for (const simWord of similarWords) this.set(simWord, word);

			const regexStr = [
				`(${word})${
					wordEnds ? `(?:${wordEnds.join('|')})?` : ''
				}`,
				...similarWords,
			].map(w => `\\b${w}\\b`).join('|');
			this.regexes.set(word, { regexStr, regex: new RegExp(regexStr, 'gi') });
		}

		this.regex = new RegExp([...this.regexes.values()].map(obj => obj.regexStr).join('|'), 'gi');

		this.words = [...this.regexes.keys()];
	}

	get(key) {
		return super.get(key.toLowerCase());
	}

}();
({ exports } = module);

assert(Array.isArray(exports.words));
assert(exports.words.every(word => typeof word === 'string' && word.length));
