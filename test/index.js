const { assert } = console;
const { prototype: LangRandProto } = require('../src/extendables/LanguageRandomness');
const fakeLang = {
	get(term, ...args) {
		return {
			TEST_ARRAY_STRING: [
				'one',
			],
			TEST_ARRAY_FUNCTION: [
				() => 'one',
			],
			TEST_FUNCTION_STRING: () => [
				'one',
			],
			TEST_FUNCTION_FUNCTION: () => [
				() => 'one',
			],
		}[term];
	},
};
assert(LangRandProto.getRandom.call(fakeLang, 'TEST_ARRAY_STRING', [], []) === 'one');
// const client = require('../src');
// client.once('ready', () => {
// 	const enUS = client.languages.get('en-US');

// 	assert(enUS.getRandom('COMMAND_FAKEKICK', [], []));
// });
