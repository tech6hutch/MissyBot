const assert = require('assert');
const strDistance = require('js-levenshtein');
const RandomImageCommand = require('../../lib/base/RandomImageCommand');
const { resolveLang } = require('../../lib/util/util');

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
		if (imageName === 'list') {
			return msg.send(this.images
				.map(img => this.client.assets.get(img).title)
				.join('\n'));
		}

		imageName = imageName && this.resolveImageNameFuzzily(imageName);

		if (msg.channel.nsfw) {
			return this.postNsfwImage(msg, imageName);
		} else {
			const m = await this.postSfwImage(msg);
			if (Math.random() < 0.05) return msg.channel.sendLocale('COMMAND_LEWD_NSFW_HINT');
			return m;
		}
	}

	resolveImageNameFuzzily(fuzzyName) {
		fuzzyName = fuzzyName.toLowerCase();
		let leastDistance = Infinity;
		let closestName;
		for (const imgName of this.images) {
			const distance = strDistance(fuzzyName, imgName.toLowerCase());
			if (distance < leastDistance) {
				leastDistance = distance;
				closestName = imgName;
			}
		}

		return closestName;
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
		for (const imageName of this.images) {
			assert(this.client.assets.has(imageName));
		}
		assert(this.client.assets.has(this.sfwImage));
	}

};
