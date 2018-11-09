const { Command } = require('klasa');
const { arrayRandom } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_POTATO_DESCRIPTION'),
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
