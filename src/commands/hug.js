const { Command } = require('klasa');

module.exports = class HugCmd extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Need a hug? 🙂',
		});
	}

	run(msg) {
		return msg.send('_Hugs_');
	}

};
