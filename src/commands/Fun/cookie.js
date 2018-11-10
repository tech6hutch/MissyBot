const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			promptLimit: 3,
			description: lang => lang.get('COMMAND_COOKIE_DESCRIPTION'),
			usage: '<milk:yesno>',
		});

		this
			.customizeResponse('milk', 'Want some milk with that?')
			.createCustomResolver('yesno', (arg, possible, message) => {
				try {
					return this.client.arguments.get('yesno').run(arg, possible, message);
				} catch (yesnoError) {
					const [first] = String(arg).toLowerCase().split(' ');
					if (first === 'with') return true;
					if (first === 'without') return false;
					throw yesnoError;
				}
			});
	}

	async run(msg, [milk]) {
		return msg.send(milk ? '🍪🥛' : '🍪');
	}

};
