const { TextChannel, DMChannel, GroupDMChannel, User } = require('discord.js');
const { Extendable, util: { isThenable } } = require('klasa');

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
		const response = language.getRandom(key, args, responseArgs);
		if (isThenable(response)) return response;
		return this.send({ content: response, ...options });
	}

};
