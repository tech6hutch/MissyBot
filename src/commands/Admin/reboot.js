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
		await this.shutdown(this.client.settings.update({ restart: {
			message: await msg.sendLocale('COMMAND_REBOOT'),
			timestamp: process.hrtime.bigint(),
		} }).then(result => result.errors.forEach(err => this.client.emit('error', err))));
	}

	async init() {
		// "message" needs to be awaited
		const [message, timestamp] = await Promise.all(['message', 'timestamp']
			.map(key => this.client.settings.fuckingResolve(`restart.${key}`)));
		await this.client.settings.reset(['message', 'timestamp']
			.map(key => `restart.${key}`));

		if (message) message.sendLocale('COMMAND_REBOOT_SUCCESS', [timestamp && getFriendlyDuration(timestamp)]);
		else this.client.emit('info', 'No restart channel');
	}

	async shutdown(waitForThis) {
		await Promise.all([
			...this.client.providers.map(provider => provider.shutdown()),
			waitForThis,
		]);
		process.exit();
	}

};
