const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'kick',
			aliases: ['fakekick'],
			description: '👢',
		});
	}

	run(msg) {
		return msg.sendRandom('COMMAND_FAKEKICK');
	}

};
