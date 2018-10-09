const { Command } = require('klasa');
const { arrayRandom } = require('../../lib/util');

module.exports = class KickCmd extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['kick'],
			description: '👢',
		});

		this.responses = [
			'Aw, do we have to?',
			'Have you tried asking them nicely?',
			"I bet they'll behave from now on. Right?",
		];
	}

	run(msg) {
		return msg.send(arrayRandom(this.responses));
	}

};
