const { Extendable, CommandUsage } = require('klasa');

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
		let { prefix } = message.guildSettings;
		if (Array.isArray(prefix)) prefix = message.prefixLength ? message.content.slice(0, message.prefixLength) : prefix[0];
		return `${/\.$/i.test(prefix) ? prefix : `${prefix} `}${this.nearlyFullUsage}`;
	}

};
