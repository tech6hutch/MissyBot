const { Command } = require('klasa');
const { getAboveUser } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['smack'],
			description: lang => lang.get('COMMAND_SLAP_DESCRIPTION'),
			usage: '[user:user]',
		});
	}

	run(msg, [user = getAboveUser(msg)]) {
		return msg.sendRandom('COMMAND_SLAP', [user]);
	}

};
