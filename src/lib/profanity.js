const assert = require('assert');
const { Collection } = require('discord.js');

// For brevity, since so many of these words can have the same suffixes
const sSuffixes = ['s', 'ing', 'ed'];
const sErSuffixes = [...sSuffixes, 'ers?'];
const esSuffixes = ['es', 'ing', 'ed'];
const esErSuffixes = [...esSuffixes, 'ers?'];
/**
 * @type {Object<string, ({ name: string, suffixes?: string[], aliases?: string[], censored?: string })[]>}
 */
const profanityToAssemble = {
	'Insults 🙊': [
		{
			name: 'bitch',
			suffixes: esSuffixes,
			censored: 'b-word (🐶)',
		},
		{
			name: 'fag',
			suffixes: ['s', 'g?ing', 'ged'],
			aliases: ['faggot', 'faggots'],
			censored: 'gay f-word 🏳️‍🌈',
		},
		{
			name: 'bastard',
			suffixes: ['s'],
			censored: '👶🏽 without 💒',
		},
		{
			name: 'slut',
			suffixes: ['s'],
			censored: 'promiscuous s-word 🤐',
		},
		{
			name: 'douche',
			suffixes: ['s'],
			aliases: ['douching', 'douched'],
			censored: 'd-word (⬆💦)',
		},
	],
	'Sexual 🔞': [
		{ name: 'fuck', suffixes: sErSuffixes },
		{
			name: 'motherfuck',
			suffixes: sErSuffixes,
			censored: 'mf-word',
		},
		{
			name: 'bugger',
			suffixes: sSuffixes,
			censored: 'b-word (🔞⛔🏞)',
		},
		{
			name: 'wank',
			suffixes: sErSuffixes,
			censored: 'w-word (↕🍆)',
		},
	],
	'Religious 😇': [
		{
			name: 'goddamn',
			suffixes: ['ed'],
			aliases: ['gdi'],
			censored: 'gd-word',
		},
		{ name: 'hell' },
		{
			name: 'heck',
			suffixes: ['ing'],
			aliases: ['hecc', 'heccing'],
			censored: 'lesser h-word',
		},
		{ name: 'bloody', censored: 'b-word (🅰🅱🆎🅾)' },
		{ name: 'damn', suffixes: sSuffixes },
		{
			name: 'darn',
			suffixes: ['ed'],
			censored: 'lesser d-word',
		},
	],
	'Racial Slurs 🏁': [
		{
			name: 'nigger',
			suffixes: ['s'],
			censored: 'n-word (👩🏿👨🏿)',
		},
		{
			name: 'nigga',
			suffixes: ['s'],
			censored: 'lesser n-word (👩🏿👨🏿)',
		},
		{
			name: 'cracker',
			suffixes: ['s'],
			censored: 'c-word (👩🏻👨🏻)',
		},
		{
			name: 'cracka',
			suffixes: ['s'],
			censored: 'lesser c-word (👩🏻👨🏻)',
		},
		{
			name: 'wetback',
			suffixes: ['s'],
			censored: 'Mexicans who must have been swimming recently',
		},
		{
			name: 'negro',
			suffixes: ['es', 's'],
			aliases: ['negress', 'negresses', 'negra', 'negras'],
			censored: 'Spanish n-word',
		},
		{
			name: 'mulatto',
			suffixes: ['es', 's'],
			aliases: ['mulato', 'mulatos', 'mulata', 'mulatas'],
			censored: 'vanilla and chocolate! 😋 (👩🏿+👩🏻)',
		},
		{
			name: 'spic',
			suffixes: ['s'],
			censored: 'spick and span!',
		},
		{
			name: 'kike',
			suffixes: ['s', 'd'],
			censored: 'k-word (✡)',
		},
		{
			name: 'chink',
			suffixes: ['s'],
			censored: 'c-word (🇨🇳)',
		},
		{
			name: 'chinaman',
			aliases: ['chinamen'],
			censored: 'c-word (🇨🇳👨🏻)',
		},
		{
			name: 'oriental',
			suffixes: ['s'],
			censored: 'people from the Orient 🌏',
		},
	],
	'Body Parts 👤': [
		{ name: 'cunt', suffixes: sSuffixes },
		{
			name: 'cock',
			suffixes: sSuffixes,
			censored: 'male c-word',
		},
		{ name: 'dick', suffixes: sSuffixes },
		{
			name: 'pussy',
			suffixes: sSuffixes,
			aliases: ['pussies', 'pussied'],
			censored: '🐱',
		},
		{
			name: 'minge',
			suffixes: ['s'],
			censored: 'British 🐱',
		},
		{
			name: 'bollock',
			suffixes: ['s'],
			censored: 'b-word (🥜)',
		},
		{ name: 'ass', suffixes: esSuffixes },
		{
			name: 'arse',
			suffixes: esSuffixes,
			censored: 'lesser a-word',
		},
		{
			name: 'asshole',
			suffixes: ['s'],
			censored: 'a-hole',
		},
		{
			name: 'arsehole',
			suffixes: ['s'],
			censored: 'lesser a-hole',
		},
	],
	'Excrement 💩': [
		{
			name: 'shit',
			suffixes: ['s', 't?ers?', 't?ing', 't?ed'],
			aliases: ['shat', 'shite'],
		},
		{ name: 'piss', suffixes: esErSuffixes },
		{ name: 'crap', suffixes: ['s', 'p?ers?', 'p?ing', 'p?ed'] },
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

class Profanity extends Collection {

	constructor() {
		super();

		this.regexes = new Collection();
		this.byCategory = new Collection();
		this.censors = new Collection();

		for (const [category, wordObjArray] of Object.entries(profanityToAssemble)) {
			const catArray = [];
			this.byCategory.set(category, catArray);
			for (const { name, suffixes, aliases = [], censored = `${name[0]}-word` } of wordObjArray) {
				catArray.push(name);
				this.set(name, name);
				for (const alias of aliases) this.set(alias, name);
				this.censors.set(name, censored);

				const regexStr = [
					`(${name})${
						suffixes ? `(?:${suffixes.join('|')})?` : ''
					}`,
					...aliases.map(alias => `(${alias})`),
				].map(w => `\\b${w}\\b`).join('|');
				this.regexes.set(name, { regexStr, regex: new RegExp(regexStr, 'gi') });
			}
		}

		this.regex = this._makeRegex();

		assert(Array.isArray(this.words) && this.words.every(word => typeof word === 'string' && word.length));
	}

	get words() {
		return this.regexes.keyArray();
	}

	get categories() {
		return this.byCategory.keyArray();
	}

	_makeRegex() {
		return new RegExp(this.regexes.map(obj => obj.regexStr).join('|'), 'gi');
	}

	get(key) {
		return super.get(key.toLowerCase());
	}

}

module.exports = new Profanity();
