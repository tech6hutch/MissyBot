const { join } = require('path');
const { Command } = require('klasa');

module.exports = class NoUCmd extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['no'],
			description: 'no u 🔀',
			usage: '[infinity:str]',
		});

		this.images = [
			'no-u.png',
			'no-u-infinity.png',
		].map(filename => ({
			attachment: join(process.cwd(), 'assets', filename),
			name: filename,
		}));
	}

	async run(msg, [infinity]) {
		// Get rid of the "u" in "no u infinity" because I don't want to clutter the usage
		if (infinity) infinity = infinity.replace(/^u\s*/, '');
		const loadingMsg = await msg.send('Rebutting your argument...');
		await msg.channel.send({
			files: [this.images[infinity ? 1 : 0]],
		});
		loadingMsg.delete();
	}

};
