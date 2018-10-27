const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'ban',
			aliases: ['fakeban'],
			description: '👮',
		});
	}

	run(msg) {
		return msg.sendRandom('COMMAND_FAKEBAN');
	}

};
