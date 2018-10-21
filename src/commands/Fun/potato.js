const { Command } = require('klasa');
const { arrayRandom } = require('../../lib/util/util');

module.exports = class PotatoCmd extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Post a random potato emoji!',
		});

		this.potatoEmojis = ['🥔', '🍠'];
	}

	init() {
		for (const emoji of this.client.emojis.values()) {
			if (emoji.name.toLowerCase().includes('potato')) this.potatoEmojis.push(emoji.toString());
		}
	}

	run(msg) {
		return msg.send(arrayRandom(this.potatoEmojis));
	}

};
