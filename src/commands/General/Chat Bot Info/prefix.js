const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['prefixes'],
			runIn: ['text'],
			guarded: true,
			description: lang => lang.get('COMMAND_PREFIX_DESCRIPTION'),
		});
	}

	run(msg) {
		return msg.sendLocale('PREFIX_REMINDER', [msg.guildSettings.prefix.length > 0 ? msg.guildSettings.prefix : undefined]);
	}

};
