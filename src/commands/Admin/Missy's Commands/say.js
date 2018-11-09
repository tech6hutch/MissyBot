const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Tell me to say something.',
			permissionLevel: 8,
			usage: '[channel:channel] <text:str> [...]',
			usageDelim: ' ',
		});

		this.msgSymbol = Symbol('say command');
	}

	async run(msg, [channel = msg, ...text]) {
		text = text.join(' ');
		const prevMsg = msg[this.msgSymbol];
		const saidMsg = await (prevMsg ?
			prevMsg.edit(text) :
			channel.send(text));
		msg[this.msgSymbol] = saidMsg;
		return msg === channel ?
			saidMsg :
			msg.send(`👌 I ${prevMsg ? 'edited' : 'posted'} it there.`);
	}

};
