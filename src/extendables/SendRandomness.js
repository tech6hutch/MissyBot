const { TextChannel, DMChannel, GroupDMChannel, User } = require('discord.js');
const { Extendable } = require('klasa');
const { arrayRandom } = require('../lib/util/util');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [TextChannel, DMChannel, GroupDMChannel, User] });
	}

	sendRandom(key, args = [], responseArgs = [], options = {}) {
		if (!Array.isArray(responseArgs)) {
			if (!Array.isArray(args)) [options, args] = [args, []];
			else [options, responseArgs] = [responseArgs, []];
		}
		const language = this.guild ? this.guild.language : this.client.languages.default;
		const response = arrayRandom(language.get(key, ...args));
		return this.send({ content: typeof response === 'function' ? response(...responseArgs) : response, ...options });
	}

};
