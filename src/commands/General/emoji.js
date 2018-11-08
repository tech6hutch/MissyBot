const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: '<:discord:503738729463021568>😮',
			usage: '<name:str>',
			aliases: ['emote'],
		});
	}

	async run(msg, [name]) {
		const emoji = this.client.emojis.find(e => e.name === name);
		return msg.send(emoji ? emoji.toString() : '❓');
	}

};
