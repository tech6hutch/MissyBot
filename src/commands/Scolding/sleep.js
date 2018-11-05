const { Command } = require('klasa');
const { naturalPause } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bedtime'],
			description: lang => lang.get('COMMAND_SLEEP_DESCRIPTION'),
			usage: '[who:mention]',
		});
	}

	async run(msg, [who = this.client.user]) {
		if (who.id === this.client.user.id) {
			if (msg.author.id === this.client.owner.id) {
				await msg.channel.send('Aw, boo. Yes sir');
				await naturalPause();
				return this.client.commands.get('reboot').run(msg);
			}

			return msg.sendRandom('COMMAND_SLEEP_SELF', [who, msg.author], [msg]);
		}

		return msg.sendRandom('COMMAND_SLEEP', [who, msg.author]);
	}

};
