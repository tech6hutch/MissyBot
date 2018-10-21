const { Command } = require('klasa');
const { arrayRandom } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'ban',
			aliases: ['fakeban'],
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
