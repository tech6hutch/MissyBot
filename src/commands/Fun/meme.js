const assert = require('assert');
const { Canvas } = require('canvas-constructor');
const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_MEME_DESCRIPTION'),
			usage: '<text:str>',
		});
	}

	run(msg, [text]) {
		const { buffer } = this.client.assets.get('meme-template');
		const width = 1239;
		const height = 1771;
		const fontSize = 28;
		return msg.sendLoading(async () => msg.channel.sendFile(
			await new Canvas(width, height)
				.addImage(buffer, 0, 0, width, height)
				.setColor('#ED1C24')
				.setTextFont(`${fontSize}px Corbel`)
				// .setTextAlign('center')
				.addText(text, 499, 684 + (fontSize / 2), 10)
				.toBufferAsync(),
			'meme.png'
		));
	}

	init() {
		assert(this.client.assets.has('meme-template'));
	}

};
