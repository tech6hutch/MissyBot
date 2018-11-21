const RandomImageCommand = require('../../lib/base/RandomImageCommand');

module.exports = class extends RandomImageCommand {

	constructor(...args) {
		super(...args, {
			enabled: false,
			aliases: ['no-context'],
			usage: '[list|quote-name:str]',
			description: lang => lang.get('COMMAND_QUOTE_DESCRIPTION'),
			// Custom
			images: [
				'minorities',
			],
		});
	}

};
