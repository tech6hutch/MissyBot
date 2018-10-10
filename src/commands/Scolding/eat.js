const { Command } = require('klasa');
const { arrayRandom } = require('../../lib/util');

module.exports = class BreakfastCmd extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Tell someone to eat.',
			usage: '[breakfast|lunch|dinner|supper|snack|something] [who:mention]',
			usageDelim: ' ',
		});

		this.eat = [
			'Eat [something], @user!',
			"@user, make sure you're eating enough, little one!",
			'@user, @author says to eat [something].',
			'@user, eat [something], little one.',
		];

		this.selfEat = [
			"But I'm a robot, I don't need to eat ;-;",
			msg => msg.send(`But I'm already eating. I have ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB of heap memory in my belly.`),
			msg => this.client.commands.get('no-u').run(msg, []),
		];
	}

	async run(msg, [meal, who = this.client.user]) {
		if (who.id === this.client.user.id || !meal) {
			const response = arrayRandom(this.selfEat);
			return typeof response === 'function' ? response(msg) : msg.send(response);
		}

		return msg.send(arrayRandom(this.eat)
			.replace('@user', who.toString())
			.replace('@author', msg.author.toString())
			.replace('[something]', meal));
	}

};
