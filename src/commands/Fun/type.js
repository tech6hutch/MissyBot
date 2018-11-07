const { Command } = require('klasa');
const { naturalPause } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_TYPE_DESCRIPTION'),
			usage: '<as> <name:...str>',
			usageDelim: ' ',
			extendedHelp: lang => lang.get('COMMAND_TYPE_EXTENDEDHELP',
				'Missy, type as FBI'),
		});
	}

	async run(msg, [, name]) {
		const { me } = msg.guild;
		const { nickname } = me;
		await me.setNickname(name, 'type cmd start');
		msg.channel.startTyping();
		await naturalPause('long');
		msg.channel.stopTyping();
		await me.setNickname(nickname, 'type cmd end');
	}

};
