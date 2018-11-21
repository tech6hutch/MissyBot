const assert = require('assert');
const RandomImageCommand = require('../../../lib/base/RandomImageCommand');
const { fuzzySearch, resolveLang } = require('../../../lib/util/util');

module.exports = class extends RandomImageCommand {

	constructor(...args) {
		super(...args, {
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
		this.sfwImage = 'nice-try';
	}

	async run(msg, [imageName]) {
		const msgOrNull = super.listIfList(msg, imageName);
		if (msgOrNull) return msgOrNull;

		imageName = imageName && fuzzySearch(imageName, this.images);

		if (msg.channel.nsfw) {
			return this.postNsfwImage(msg, imageName);
		} else {
			const m = await this.postSfwImage(msg);
			if (Math.random() < 0.05) return msg.channel.sendLocale('COMMAND_LEWD_NSFW_HINT');
			return m;
		}
	}

	postSfwImage(channel) {
		return channel.sendLoading(
			() => this.client.assets.get(this.sfwImage).uploadTo(channel)
		);
	}
	postSfwImageSomewhere(hereChan, toChan) {
		return hereChan.sendLoadingFor(
			toChan,
			() => this.client.assets.get(this.sfwImage).uploadTo(toChan)
		);
	}

	postNsfwImage(channel, imageName) {
		return channel.sendLoading(
			() => (imageName ? this.getIn(imageName) : this.get()).uploadTo(channel),
			{ loadingText: resolveLang(channel).get('COMMAND_LEWD_LOADING_TEXT') }
		);
	}
	postNsfwImageSomewhere(hereChan, toChan, imageName) {
		return hereChan.sendLoadingFor(
			toChan,
			() => (imageName ? this.getIn(imageName) : this.get()).uploadTo(toChan),
			{ loadingText: resolveLang(hereChan).get('COMMAND_LEWD_LOADING_TEXT') }
		);
	}

	init() {
		super.init();
		assert(this.client.assets.has(this.sfwImage));
	}

};
