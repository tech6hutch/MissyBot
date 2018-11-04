const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Ask me to send something.',
			usage: '<what:str> [to] [whom:mention]',
			usageDelim: ' ',
			extendedHelp: "If you don't mention anyone, I'll just send it here, or to you.",
		});

		this.customizeResponse('what', "You didn't tell me what to send!");
	}

	async run(msg, [what, , whom = msg]) {
		const local = msg === whom;

		switch (what) {
			case 'help': {
				const helpCmd = this.client.commands.get('help');
				return local ?
					helpCmd.sendHelp(msg) :
					helpCmd.sendHelp(msg, null, whom, {
						doneText: '📥 | I sent them help about my commands.',
						failText: '❌ | I couldn\'t DM them :/',
					});
			}

			case 'nudes':
			case 'noods':
				return local ?
					this.client.commands.get('lewd').postSfwImage(msg) :
					this.client.commands.get('lewd').postSfwImageSomewhere(msg, whom);

			case 'potato': {
				const potatoP = this.client.commands.get('potato').run(whom);
				return local ? potatoP : msg.send('Sent them a potato 👌');
			}

			case 'marbles': return msg.send('I seem to have lost all of mine @_@');

			default:
				return msg.send("I don't know how to send that >_<");
		}
	}

};
