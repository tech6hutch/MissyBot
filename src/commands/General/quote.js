const RandomImageCommand = require('../../lib/base/RandomImageCommand');

module.exports = class extends RandomImageCommand {

	constructor(...args) {
		super(...args, {
			enabled: false,
			aliases: ['no-context'],
			description: lang => lang.get('COMMAND_QUOTE_DESCRIPTION'),
			usage: '[list|quote-name:str]',
			// Custom
			images: [
				'minorities',
			],
		});
	}

};
