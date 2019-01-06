const { Command } = require('klasa');
const { getAboveUser } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_ATTACK_DESCRIPTION'),
			extendedHelp: lang => lang.get('COMMAND_ATTACK_EXTENDEDHELP'),
			usage: '[user:user]',
		});

		this.emoji = '<a:attack:530938382763819030>';
	}

	run(msg, [user = getAboveUser(msg)]) {
		return msg.send(`${user} ${this.emoji}`);
	}

};
