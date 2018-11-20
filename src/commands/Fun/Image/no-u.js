const assert = require('assert');
const MissyCommand = require('../../../lib/structures/MissyCommand');

module.exports = class extends MissyCommand {

	constructor(...args) {
		super(...args, {
			aliases: ['no', 'no u'],
			description: 'no u 🔀',
			usage: '<u|you> [infinity]',
			usageDelim: ' ',
			helpListName: 'no u',
			helpUsage: 'no <u|you> [infinity]',
			extendedHelp: lang => lang.get('COMMAND_NOU_EXTENDEDHELP', [
				'Missy, no u',
				'Missy, no u infinity',
			]).join('\n'),
		});
	}

	async run(msg, [, infinity]) {
		return msg.sendLoading(
			() => this.client.assets.get(`no-u${infinity ? '-infinity' : ''}`).uploadTo(msg),
			{ loadingText: msg.language.get('COMMAND_NOU_LOADING_TEXT') }
		);
	}

	init() {
		assert(this.client.assets.has('no-u'));
		assert(this.client.assets.has('no-u-infinity'));
	}

};
