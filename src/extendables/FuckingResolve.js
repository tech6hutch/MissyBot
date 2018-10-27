const { Extendable, Settings } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [Settings] });
	}

	/**
	 * Resolve shit, until SG gets a native way to do this
	 * @param {string|string[]} path The path of the key's value to get from this instance
	 * @param {KlasaGuild} [guild] The guild, used to resolve
	 * @param {Language} [language] The language to show the message in
	 * @returns {Promise<*>} The resolved setting, or undefined if not found
	 * @this {Settings}
	 */
	async fuckingResolve(path, guild, language = guild ? guild.language : this.client.languages.default) {
		const route = typeof path === 'string' ? path.split('.') : path;
		const piece = this.gateway.schema.get(route);
		if (!piece) throw undefined;

		let objOrData = this; // eslint-disable-line consistent-this
		for (const key of route) objOrData = objOrData[key];

		try {
			return await piece.serializer.deserialize(objOrData, piece, language, guild);
		} catch (e) {
			this.client.emit('error', e);
			throw undefined;
		}
	}

};
