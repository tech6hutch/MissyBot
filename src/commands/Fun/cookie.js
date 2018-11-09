const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			promptLimit: 3,
			promptTime: 30000,
			description: '',
			usage: '<milk:boolean>',
		});
	}

	async run(msg, [milk]) {
		return msg.send(milk ? '🍪🥛' : '🍪');
	}

};
