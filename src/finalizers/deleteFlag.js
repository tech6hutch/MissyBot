const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {

	async run(message, command) {
		if (message.flags.delete && !command.deletable) await message.delete();
	}

};
