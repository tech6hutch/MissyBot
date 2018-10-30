const assert = require('assert');

const sEnds = ['s', 'ing', 'ed'];
const sErEnds = [...sEnds, 'ers?'];
const esEnds = ['es', 'ing', 'ed'];
const esErEnds = [...esEnds, 'ers?'];
/**
 * @type {Object<string, ([string, string[]?, string[]?])[]>}
 */
const profanityToAssemble = {
	excrement: [
		['shit', ['s', 't?ers?', 't?ing', 't?ed'], ['shat', 'shite']],
		['piss', esErEnds],
		['crap', ['s', 'p?ers?', 'p?ing', 'p?ed']],
	],
	bodyParts: [
		['cunt', sEnds],
		['cock', sEnds],
		['dick', sEnds],
		['pussy', sEnds, ['pussies', 'pussied']],
		['bollock', ['s']],
		['asshole', ['s']],
		['arsehole', ['s']],
		['ass', esEnds],
		['arse', esEnds],
	],
	insults: [
		['bitch', esEnds],
		['fag', ['s', 'g?ing', 'ged'], ['faggot', 'faggots']],
		['bastard', ['s']],
		['slut', ['s']],
		['douche', ['s'], ['douching', 'douched']],
	],
	sexual: [
		['fuck', sErEnds],
		['bugger', sEnds],
		['wank', sErEnds],
	],
	religious: [
		['goddamn', ['ed'], ['gdi']],
		['hell'],
		['bloody'],
		['damn', sEnds],
		['darn', ['ed']],
	],
};
for (const array of Object.values(profanityToAssemble).reduce((arrays, arr) => arrays.concat(arr))) {
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
		this.categories = new Map();

		for (const [category, wordArrays] of Object.entries(profanityToAssemble)) {
			const catArray = [];
			this.categories.set(category, catArray);
			for (const [word, wordEnds, similarWords = []] of wordArrays) {
				catArray.push(word);
				this.set(word, word);
				for (const simWord of similarWords) this.set(simWord, word);

				const regexStr = [
					`(${word})${
						wordEnds ? `(?:${wordEnds.join('|')})?` : ''
					}`,
					...similarWords.map(simWord => `(${simWord})`),
				].map(w => `\\b${w}\\b`).join('|');
				this.regexes.set(word, { regexStr, regex: new RegExp(regexStr, 'gi') });
			}
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
