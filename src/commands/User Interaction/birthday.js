const { join } = require('path');
const { Command } = require('klasa');
const { postImage } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_BIRTHDAY_DESCRIPTION'),
			usage: '[birthdayPerson:mention] [...]',
			usageDelim: ' ',
		});

		const imageName = 'happy-birthday.png';
		this.birthdayImage = {
			attachment: join(process.cwd(), 'assets', imageName),
			name: imageName,
		};
	}

	async run(msg, birthdayPeople) {
		return postImage(msg, this.birthdayImage, {
			imageText: msg.language.get(
				birthdayPeople.length > 0 ? 'COMMAND_BIRTHDAY_MENTIONS' : 'COMMAND_BIRTHDAY',
				birthdayPeople
			),
		});
	}

};
