const assert = require('assert');
const { Command } = require('klasa');
const { arrayRandom } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		const potatoTypes = ['emoji', 'image'];

		super(...args, {
			usage: `<${potatoTypes.join('|')}|random:default>`,
			description: lang => lang.get('COMMAND_POTATO_DESCRIPTION'),
			subcommands: true,
		});

		this.potatoTypes = potatoTypes;
		this.potatoEmojis = ['🥔', '🍠'];

		assert(potatoTypes.every(method => typeof this[method] === 'function'));
	}

	random(msg) {
		return this[arrayRandom(this.potatoTypes)](msg);
	}

	emoji(msg) {
		return msg.send(arrayRandom(this.potatoEmojis));
	}

	image(msg) {
		return msg.sendLoading(() => this.client.assets.get('potato-cat').uploadTo(msg));
	}

	init() {
		for (const emoji of this.client.emojis.values()) {
			if (emoji.name.toLowerCase().includes('potato')) this.potatoEmojis.push(emoji.toString());
		}
	}

};
