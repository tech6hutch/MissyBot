const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_PAT_DESCRIPTION'),
		});
	}

	run(msg) {
		return msg.send('_Pat pat_');
	}

};
