const assert = require('assert');
const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'no u',
			aliases: ['no'],
			description: 'no u 🔀',
			usage: '<u|you> [infinity]',
			usageDelim: ' ',
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
