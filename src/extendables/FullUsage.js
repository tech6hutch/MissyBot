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
		let prefix = message.prefixLength ? message.content.slice(0, message.prefixLength) : message.guildSettings.prefix;
		if (message.prefix === this.client.monitors.get('commandHandler').prefixMention) prefix = `@${this.client.user.tag}`;
		else if (Array.isArray(prefix)) [prefix] = prefix;
		return `${/\.$/i.test(prefix) ? prefix : `${prefix} `}${this.nearlyFullUsage}`;
	}

};
