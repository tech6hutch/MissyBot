const { Command } = require('klasa');
const { arrayRandom, naturalPause } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bedtime'],
			description: 'Tell someone to get their butt to bed!',
			usage: '[who:mention]',
		});

		this.sleep = [
			'Go to sleep, @user!',
			"@user, make sure you're getting enough sleep, little one!",
			"@user, @author says it's bedtime.",
			'@user, get your butt to sleep, little one.',
		];

		this.selfSleep = [
			"But I'm a robot, I don't need to sleep ;-;",
			"You can't tell me to sleep!",
			msg => this.client.commands.get('no-u').run(msg, []),
		];
	}

	async run(msg, [who = this.client.user]) {
		if (who.id === this.client.user.id) {
			if (msg.author.id === this.client.owner.id) {
				await msg.channel.send('Aw, boo. Yes sir');
				await naturalPause();
				return this.client.commands.get('reboot').run(msg);
			}

			const response = arrayRandom(this.selfSleep);
			return typeof response === 'function' ? response(msg) : msg.send(response);
		}

		return msg.send(arrayRandom(this.sleep)
			.replace('@user', who.toString())
			.replace('@author', msg.author.toString()));
	}

};
