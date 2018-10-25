const { util: { isFunction } } = require('klasa');
const RandomResponseCommand = require('../../lib/base/RandomResponseCommand');
const { naturalPause } = require('../../lib/util/util');

module.exports = class extends RandomResponseCommand {

	constructor(...args) {
		super(...args, {
			aliases: ['bedtime'],
			description: 'Tell someone to get their butt to bed!',
			usage: '[who:mention]',
			// Custom
			defaultTerm: 'COMMAND_SLEEP',
		});
	}

	async run(msg, [who = this.client.user]) {
		if (who.id === this.client.user.id) {
			if (msg.author.id === this.client.owner.id) {
				await msg.channel.send('Aw, boo. Yes sir');
				await naturalPause();
				return this.client.commands.get('reboot').run(msg);
			}

			const response = this.getResponse(msg.language, 'COMMAND_SLEEP_SELF');
			return isFunction(response) ? response(msg) : msg.send(response);
		}

		return this.sendResponse(msg, undefined, who, msg.author);
	}

};
