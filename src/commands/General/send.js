const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: lang => lang.get('COMMAND_SEND_DESCRIPTION'),
			usage: '<what:str> [to] [whom:mention]',
			usageDelim: ' ',
			extendedHelp: lang => lang.get('COMMAND_SEND_EXTENDEDHELP'),
		});

		this.customizeResponse('what', msg => msg.sendLocale('COMMAND_SEND_MISSING_WHAT'));
	}

	async run(msg, [what, , whom = msg]) {
		const local = msg === whom;

		switch (what) {
			case 'help': {
				const helpCmd = this.client.commands.get('help');
				return local ?
					helpCmd.sendHelp(msg) :
					helpCmd.sendHelp(msg, null, whom, {
						doneText: msg.language.get('COMMAND_HELP_OTHER_DM'),
						failText: msg.language.get('COMMAND_HELP_OTHER_NODM'),
					});
			}

			case 'nudes':
			case 'noods':
				return local ?
					this.client.commands.get('lewd').postSfwImage(msg) :
					this.client.commands.get('lewd').postSfwImageSomewhere(msg, whom);

			case 'potato': {
				const potatoP = this.client.commands.get('potato').run(whom);
				return local ? potatoP : msg.sendLocale('COMMAND_SEND_POTATO');
			}

			case 'marbles': return msg.sendLocale('COMMAND_SEND_MARBLES');

			default: return msg.sendLocale('COMMAND_SEND_UNKNOWN');
		}
	}

};
