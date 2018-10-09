const { Command } = require('klasa');

module.exports = class SayCmd extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Tell me to say something.',
			usage: '[channel:channel] <text:str> [...]',
			usageDelim: ' ',
		});
	}

	run(msg, [channel = msg, ...text]) {
		const m = channel.send(text.join(' '));
		return msg === channel ? m : msg.send('👌 I posted it there.');
	}

};
