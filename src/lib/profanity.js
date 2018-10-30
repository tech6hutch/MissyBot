const assert = require('assert');

const sEnds = ['s', 'ing', 'ed'];
const sErEnds = [...sEnds, 'ers?'];
const esEnds = ['es', 'ing', 'ed'];
const esErEnds = [...esEnds, 'ers?'];
/**
 * @type {Object<string, ({ name: string, wordEnds?: string[], aliases?: string[], censored?: string })[]>}
 */
const profanityToAssemble = {
	'Excrement 💩': [
		{
			name: 'shit',
			wordEnds: ['s', 't?ers?', 't?ing', 't?ed'],
			aliases: ['shat', 'shite'],
		},
		{ name: 'piss', wordEnds: esErEnds },
		{ name: 'crap', wordEnds: ['s', 'p?ers?', 'p?ing', 'p?ed'] },
	],
	'Body Parts 👤': [
		{ name: 'cunt', wordEnds: sEnds },
		{
			name: 'cock',
			wordEnds: sEnds,
			censored: 'male c-word',
		},
		{ name: 'dick', wordEnds: sEnds },
		{
			name: 'pussy',
			wordEnds: sEnds,
			aliases: ['pussies', 'pussied'],
		},
		{
			name: 'bollock',
			wordEnds: ['s'],
			censored: 'b-word (🥜)',
		},
		{ name: 'ass', wordEnds: esEnds },
		{
			name: 'arse',
			wordEnds: esEnds,
			censored: 'lesser a-word',
		},
		{
			name: 'asshole',
			wordEnds: ['s'],
			censored: 'a-hole',
		},
		{
			name: 'arsehole',
			wordEnds: ['s'],
			censored: 'lesser a-hole',
		},
	],
	'Insults 🙊': [
		{ name: 'bitch', wordEnds: esEnds },
		{
			name: 'fag',
			wordEnds: ['s', 'g?ing', 'ged'],
			aliases: ['faggot', 'faggots'],
			censored: 'gay f-word 🏳‍🌈',
		},
		{ name: 'bastard', wordEnds: ['s'] },
		{
			name: 'slut',
			wordEnds: ['s'],
			censored: 'promiscuous s-word 🤐',
		},
		{
			name: 'douche',
			wordEnds: ['s'],
			aliases: ['douching', 'douched'],
			censored: 'd-word (⬆💦)',
		},
	],
	'Sexual 🔞': [
		{ name: 'fuck', wordEnds: sErEnds },
		{
			name: 'bugger',
			wordEnds: sEnds,
			censored: 'b-word (🔞⛔🏞)',
		},
		{
			name: 'wank',
			wordEnds: sErEnds,
			censored: 'w-word (↕🍆)',
		},
	],
	'Religious 😇': [
		{
			name: 'goddamn',
			wordEnds: ['ed'],
			aliases: ['gdi'],
			censored: 'gd-word',
		},
		{ name: 'hell' },
		{ name: 'bloody', censored: 'b-word (🅰🅱🆎🅾)' },
		{ name: 'damn', wordEnds: sEnds },
		{
			name: 'darn',
			wordEnds: ['ed'],
			censored: 'lesser d-word',
		},
	],
};
for (const obj of Object.values(profanityToAssemble).reduce((arrays, catArr) => arrays.concat(catArr))) {
	const { name, wordEnds, aliases, censored } = obj;
	assert(typeof name === 'string' && name.length);
	assert((Array.isArray(wordEnds) && wordEnds.length) || wordEnds === undefined);
	assert((Array.isArray(aliases) && aliases.length) || aliases === undefined);
	assert((typeof censored === 'string' && censored.length) || censored === undefined);
	assert((len => len >= 1 && len <= 4)(Object.keys(obj).length));
}

module.exports = new class extends Map {

	constructor() {
		super();

		this.regexes = new Map();
		this.categories = new Map();
		this.censors = new Map();

		for (const [category, wordObjArray] of Object.entries(profanityToAssemble)) {
			assert(typeof category === 'string');
			assert(Array.isArray(wordObjArray) && wordObjArray.length);
			const catArray = [];
			this.categories.set(category, catArray);
			for (const { word, wordEnds, aliases = [], censored = `${word[0]}-word` } of wordObjArray) {
				catArray.push(word);
				this.set(word, word);
				for (const alias of aliases) this.set(alias, word);
				this.censors.set(word, censored);

				const regexStr = [
					`(${word})${
						wordEnds ? `(?:${wordEnds.join('|')})?` : ''
					}`,
					...aliases.map(alias => `(${alias})`),
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
