const assert = require('assert');

const profanityRegexes = new Map();
module.exports = { regexes: profanityRegexes };
({ exports } = module);

const sEnds = ['s', 'ing', 'ed'];
const esEnds = ['es', 'ing', 'ed'];
/**
 * @type {([string, string[], (string[] | undefined)])[]}
 */
const profanityToAssemble = [
	// Excrement
	['shit', ['s', 't?ing', 't?ed'], ['shat']],
	['piss', esEnds],
	['crap', ['s', 'p?ing', 'p?ed']],
	// Body parts
	['dick', sEnds],
	['cock', sEnds],
	['pussy', sEnds, ['pussies', 'pussied']],
	['ass', esEnds],
	['asshole', ['s']],
	// Insults
	['bitch', esEnds],
	['fag', ['s', 'g?ing', 'ged'], ['faggot', 'faggots']],
	['bastard', ['s']],
	['douche', ['s'], ['douching', 'douched']],
	['slut', ['s']],
	// General & religious
	['fuck', sEnds],
	['bloody'],
	['damn', sEnds],
	['darn', ['ed']],
];
for (const array of profanityToAssemble) {
	assert(typeof array[0] === 'string' && array[0].length);
	assert(Array.isArray(array[1]) && array[1].length);
	assert(typeof array[2] === 'undefined' || Array.isArray(array[2]));
	assert([2, 3].includes(array.length));
}

for (const [word, wordEnds, similarWords = []] of profanityToAssemble) {
	const regexStr = [
		`(${word})${
			wordEnds ? `(?:${wordEnds.join('|')})?` : ''
		}`,
		...similarWords,
	].map(w => `\\b${w}\\b`).join('|');
	profanityRegexes.set(word, { regexStr, regex: new RegExp(regexStr, 'gi') });
}

exports.regex = new RegExp([...profanityRegexes.values()].map(obj => obj.regexStr).join('|'), 'gi');

/**
 * @type {string[]}
 */
exports.words = [...profanityRegexes.keys()];
assert(Array.isArray(exports.words));
assert(exports.words.every(word => typeof word === 'string' && word.length));
