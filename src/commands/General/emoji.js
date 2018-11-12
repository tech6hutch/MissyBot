const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: '<:discord:503738729463021568>😮',
			usage: '<name:str> [...]',
			usageDelim: ' ',
			aliases: ['emote'],
		});
	}

	async run(msg, names) {
		const emojis = this.client.emojis.array().filter(e => names.includes(e.name));
		return msg.send(emojis.length ?
			('image' in msg.flags ? emojis.map(e => e.url) : emojis).join(' ') :
			'❓');
	}

};
