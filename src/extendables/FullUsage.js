const { Extendable, CommandUsage } = require('klasa');
const { last } = require('../lib/util/util');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [CommandUsage] });
	}

	/**
	 * Creates a full usage string including prefix and commands/aliases for documentation/help purposes
	 * @param {KlasaMessage} message The message context for which to generate usage for
	 * @returns {string}
	 */
	fullUsage(message) {
		const prefix = message.localPrefix;
		return `${last(prefix) === '.' ? prefix : `${prefix} `}${this.nearlyFullUsage}`;
	}

};
