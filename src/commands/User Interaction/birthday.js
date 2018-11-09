const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_BIRTHDAY_DESCRIPTION'),
			usage: '[birthdayPerson:mention] [...]',
			usageDelim: ' ',
		});
	}

	async run(msg, birthdayPeople) {
		return msg.sendLoading(() => this.client.assets.get('happy-birthday').uploadTo(msg, {}, {
			caption: msg.language.get(
				birthdayPeople.length > 0 ? 'COMMAND_BIRTHDAY_MENTIONS' : 'COMMAND_BIRTHDAY',
				birthdayPeople
			),
		}));
	}

	init() {
		require('assert')(this.client.assets.has('happy-birthday'));
	}

};
