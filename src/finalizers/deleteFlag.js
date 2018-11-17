const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {

	async run(message, command) {
		if (message.flags.delete && !command.deletable) {
			if (message.deletable) await message.delete();
			else if (message.reactable) await message.react('⛔');
			else await message.author.sendLocale('FINALIZER_DELETE_FLAG_NO_DELETE').catch(() => null);
		}
	}

};
