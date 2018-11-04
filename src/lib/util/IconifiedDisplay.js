const { MessageEmbed } = require('discord.js');
const ReactionHandler = require('./ReactionHandler');

class IconifiedDisplay {

	constructor({
		user, infoPage, pages, emojis,
		msgContent = '', template = new MessageEmbed(),
	}) {
		// To make sure I don't derp and mutate the template
		Object.freeze(template);
		for (const key of Object.keys(template)) {
			if (typeof template[key] === 'object') Object.freeze(template[key]);
		}

		this.user = user;
		this.content = msgContent;

		this.pages = {
			info: infoPage,
			...pages,
		};

		this.emojis = {
			info: 'ℹ',
			...emojis,
			stop: '⏹',
		};
	}

	async run(msg, options = {}) {
		const emojis = Object.values(this.emojis);
		return new this.constructor.ReactionHandler(
			await msg.edit(this.content, { embed: this.pages.info }),
			(reaction, user) => emojis.includes(reaction.emoji.name) && user === this.user,
			options,
			this,
			emojis
		);
	}

}

IconifiedDisplay.ReactionHandler = ReactionHandler;

module.exports = IconifiedDisplay;
