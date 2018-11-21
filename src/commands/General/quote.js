const RandomImageCommand = require('../../lib/base/RandomImageCommand');

module.exports = class extends RandomImageCommand {

	constructor(...args) {
		super(...args, {
			enabled: false,
			aliases: ['no-context'],
			description: 'Get a no-context quote from Missy.',
			usage: '[list|quote-name:str]',
			// Custom
			images: [
				'minorities',
			],
		});
	}

};
