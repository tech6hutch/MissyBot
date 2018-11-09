const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Tell me to message someone.',
			permissionLevel: 9,
			usage: '[recipient:user] <text:str> [...]',
			usageDelim: ' ',
		});

		this.msgSymbol = Symbol('DM command');
	}

	async run(msg, [recipient = msg.author, ...text]) {
		text = text.join(' ');
		const prevMsg = msg[this.msgSymbol];
		const dm = await (prevMsg ?
			prevMsg.edit(text) :
			recipient.send(text));
		msg[this.msgSymbol] = dm;
		return msg.channel.recipient === recipient ?
			dm :
			msg.send(`👌 I ${prevMsg ? 'edited' : 'sent'} it.`);
	}

};
