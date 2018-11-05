const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_EAT_DESCRIPTION'),
			usage: '[breakfast|lunch|dinner|supper|snack|something] [who:mention]',
			usageDelim: ' ',
		});
	}

	async run(msg, [meal, who = this.client.user]) {
		return msg.sendRandom(
			who.id === this.client.user.id || !meal ? 'COMMAND_EAT_SELF' : 'COMMAND_EAT',
			[meal, who, msg.author],
			[msg]
		);
	}

};
