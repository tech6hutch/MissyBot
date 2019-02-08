import assert from 'assert';
import { Canvas } from 'canvas-constructor';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../../lib/MissyClient';
import MissyCommand from '../../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: lang => lang.get('COMMAND_MEME_DESCRIPTION'),
			usage: '<text:str>',
		});
	}

	run(msg: KlasaMessage, [text]: [string]) {
		const { buffer } = this.client.assets.get('meme-template');
		const width = 1239;
		const height = 1771;
		const fontSize = 28;
		return msg.sendLoading(async () => msg.channel.sendFile(
			await new Canvas(width, height)
				.addImage(buffer!, 0, 0, width, height)
				.setColor('#ED1C24')
				.setTextFont(`${fontSize}px Corbel`)
				// .setTextAlign('center')
				.addText(text, 499, 684 + (fontSize / 2), 10)
				.toBufferAsync(),
			'meme.png'
		));
	}

	async init() {
		assert(this.client.assets.has('meme-template'));
	}

}
