const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			promptLimit: 3,
			promptTime: 30000,
			description: '',
			usage: '<milk:boolean>',
			// So any additional input is allowed
			usageDelim: ' ',
		});
	}

	async run(msg, [milk]) {
		return msg.send(milk ? '🍪🥛' : '🍪');
	}

};
