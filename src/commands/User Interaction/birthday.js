const { join } = require('path');
const { Command } = require('klasa');
const { smartJoin, postImage } = require('../../lib/util');

module.exports = class BirthdayCmd extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Wish someone (or multiple people) a happy birthday 🎂',
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
			imageText: birthdayPeople.length > 0 ?
				`Happy birthday, ${smartJoin(birthdayPeople)}!` :
				'Happy birthday!',
		});
	}

};
