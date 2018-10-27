const { Extendable, Language } = require('klasa');
const { arrayRandom } = require('../lib/util/util');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [Language] });
	}

	/**
	 * Get a random element from a language term array
	 * @param {string} term The string or function to look up
	 * @param {*[]} args Any arguments to pass to the lookup
	 * @param {*[]} elArgs Any arguments to pass to the random result
	 * @returns {string|Function}
	 */
	getRandom(term, args, elArgs) {
		const value = arrayRandom(this.get(term, ...args));
		return typeof value === 'function' ? value(...elArgs) : value;
	}

};
