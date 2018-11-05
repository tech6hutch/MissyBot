const RandomImageCommand = require('../../lib/base/RandomImageCommand');
const { postImage } = require('../../lib/util/util');

module.exports = class extends RandomImageCommand {

	constructor(...args) {
		super(...args, {
			name: 'no u',
			aliases: ['no'],
			description: 'no u 🔀',
			usage: '<u> [infinity]',
			usageDelim: ' ',
			extendedHelp: lang => lang.get('COMMAND_NOU_EXTENDEDHELP', [
				'Missy, no u',
				'Missy, no u infinity',
			]).join('\n'),
			// Custom
			images: [
				'no-u.png',
				'no-u-infinity.png',
			],
		});
	}

	async run(msg, [, infinity]) {
		return postImage(
			msg,
			this.images.get(`no-u${infinity ? '-infinity' : ''}.png`),
			{
				loadingText: msg.language.get('COMMAND_NOU_LOADING_TEXT'),
			}
		);
	}

};
