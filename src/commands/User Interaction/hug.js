const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_HUG_DESCRIPTION'),
		});
	}

	run(msg) {
		return msg.send('_Hugs_');
	}

};
