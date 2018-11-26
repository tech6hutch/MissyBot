import assert from 'assert';
import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../../lib/MissyClient';
import RandomImageCommand from '../../../lib/base/RandomImageCommand';
import { fuzzySearch, resolveLang } from '../../../lib/util/util';
import { Sendable } from '../../../lib/util/types';

export default class extends RandomImageCommand {

	sfwImage = 'nice-try';

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: lang => lang.get('COMMAND_LEWD_DESCRIPTION'),
			usage: '[list|image-name:str]',
			// Custom
			images: [
				'send-nudes',
				'lewd-potato',
				'succubus',
				'lust',
				'potato-butt',
			],
		});
	}

	async run(msg: KlasaMessage, [imageName]: [string | undefined]) {
		const msgOrNull = super.listIfList(msg, imageName);
		if (msgOrNull) return msgOrNull;

		const { channel } = msg;
		imageName = imageName && fuzzySearch(imageName, this.images);
		if (!(channel instanceof TextChannel) || channel.nsfw) {
			return this.postNsfwImage(msg, imageName);
		} else {
			const m = await this.postSfwImage(msg);
			if (Math.random() < 0.05) return channel.sendLocale('COMMAND_LEWD_NSFW_HINT');
			return m;
		}
	}

	postSfwImage(channel: Sendable) {
		return channel.sendLoading(
			() => this.client.assets.get(this.sfwImage).uploadTo(channel)
		);
	}
	postSfwImageSomewhere(hereChan: Sendable, toChan: Sendable) {
		return hereChan.sendLoadingFor(
			toChan,
			() => this.client.assets.get(this.sfwImage).uploadTo(toChan)
		);
	}

	postNsfwImage(channel: Sendable, imageName?: string | undefined) {
		return channel.sendLoading(
			() => (imageName ? this.getIn(imageName) : this.get()).uploadTo(channel),
			{ loadingText: resolveLang(channel).get('COMMAND_LEWD_LOADING_TEXT') }
		);
	}
	postNsfwImageSomewhere(hereChan: Sendable, toChan: Sendable, imageName?: string | undefined) {
		return hereChan.sendLoadingFor(
			toChan,
			() => (imageName ? this.getIn(imageName) : this.get()).uploadTo(toChan),
			{ loadingText: resolveLang(hereChan).get('COMMAND_LEWD_LOADING_TEXT') }
		);
	}

	async init() {
		await super.init();
		assert(this.client.assets.has(this.sfwImage));
	}

}
