const RandomImageCommand = require('../../lib/base/RandomImageCommand');
const { FileCollection } = RandomImageCommand;
const { postImage, postImageSomewhere } = require('../../lib/util/util');

module.exports = class extends RandomImageCommand {

	constructor(...args) {
		super(...args, {
			description: 'Nice try. 😝',
			usage: '[image-name:str]',
			// Custom
			images: [
				'send-nudes.png',
				'lewd-potato.png',
				'succubus.png',
				'lust.png',
			],
		});

		this.sfwImage = null;
		this.sfwImageLoaded = FileCollection.makeDJSFileOption('nice-try.png');
		this.postImageOptions = { loadingText: '<.<\n>.>' };
	}

	async init() {
		this.sfwImage = await this.sfwImageLoaded;
	}

	async run(msg, [imageName = this.getName()]) {
		if (msg.channel.nsfw) {
			return this.postNsfwImage(msg, imageName);
		} else {
			const m = await this.postSfwImage(msg);
			if (Math.random() < 0.05) return msg.channel.sendLocale('COMMAND_LEWD_NSFW_HINT');
			return m;
		}
	}

	postSfwImage(channel) {
		return postImage(channel, this.sfwImage);
	}
	postSfwImageSomewhere(hereChan, toChan) {
		return postImageSomewhere(hereChan, toChan, this.sfwImage);
	}

	postNsfwImage(channel, imageName = this.getName()) {
		return this.sendTo(channel, [imageName], this.postImageOptions);
	}
	postNsfwImageSomewhere(hereChan, toChan, imageName = this.getName()) {
		return this.sendFromTo(hereChan, toChan, [imageName], this.postImageOptions);
	}

};
