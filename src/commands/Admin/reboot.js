const { Command } = require('klasa');
const { getFriendlyDuration } = require('../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 10,
			guarded: true,
			description: language => language.get('COMMAND_REBOOT_DESCRIPTION')
		});
	}

	async run(msg) {
		const rebootMsg = await msg.sendLocale('COMMAND_REBOOT');
		await Promise.all([
			this.client.settings.update({ restart: {
				message: rebootMsg,
				timestamp: process.hrtime.bigint(),
			} }).then(result => result.errors.forEach(err => this.client.emit('error', err))),
			Promise.all(this.client.providers.map(provider => provider.shutdown())),
		]);
		process.exit();
	}

	async init() {
		const [message, timestamp] = await Promise.all(
			['message', 'timestamp']
				.map(key => this.client.settings.fuckingResolve(`restart.${key}`))
		).catch(() => [null, null]);

		await this.client.settings.reset(['message', 'timestamp'].map(key => `restart.${key}`));

		if (message) {
			message.sendLocale('COMMAND_REBOOT_SUCCESS', [timestamp ? getFriendlyDuration(timestamp) : null]);
		} else {
			this.client.emit('warn', 'No restart channel');
		}
	}

};
