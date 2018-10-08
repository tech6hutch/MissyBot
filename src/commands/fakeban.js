const { Command } = require('klasa');
const { arrayRandom } = require('../lib/util');

module.exports = class BanCmd extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ban'],
			description: '👮',
		});

		this.responses = [
			'Please give them another chance ;-;',
			"Won't you give them another chance? For me?",
			'Awww, are you going to ban them?',
		];
	}

	run(msg) {
		return msg.send(arrayRandom(this.responses));
	}

};
