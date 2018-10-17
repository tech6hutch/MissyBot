const { Command } = require('klasa');

module.exports = class DMCmd extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Tell me to message someone.',
			usage: '[recipient:user] <text:str> [...]',
			usageDelim: ' ',
		});
	}

	run(msg, [recipient = msg.author, ...text]) {
		recipient.send(text.join(' '));
		return msg.send('👌 I sent it.');
	}

};
