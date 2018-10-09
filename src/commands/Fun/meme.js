const { join } = require('path');
const fsn = require('fs-nextra');
const { Canvas } = require('canvas-constructor');
const { Command } = require('klasa');
const { postImage } = require('../../lib/util');

module.exports = class MemeCmd extends Command {

	constructor(...args) {
		super(...args, {
			description: "It seems I've made a meme!",
			usage: '<text:str>',
		});

		const imageName = 'meme-template.png';
		this.templateImage = {
			attachment: join(process.cwd(), 'assets', imageName),
			name: imageName,
		};
	}

	async run(msg, [text]) {
		const templateImage = await fsn.readFile(this.templateImage.attachment);
		const width = 1239;
		const height = 1771;
		const fontSize = 28;
		const image = await new Canvas(width, height)
			.addImage(templateImage, 0, 0, width, height)
			.setColor('#ED1C24')
			.setTextFont(`${fontSize}px Corbel`)
			// .setTextAlign('center')
			.addText(text, 499, 684 + (fontSize / 2), 10)
			.toBufferAsync();
		return postImage(msg, image);
	}

};
