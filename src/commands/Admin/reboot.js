const { Command } = require('klasa');
const { getFriendlyDuration } = require('../../lib/util/util');

const rebootKeys = ['message', 'timestamp'].map(key => `restart.${key}`);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 10,
			guarded: true,
			description: language => language.get('COMMAND_REBOOT_DESCRIPTION')
		});
	}

	async run(msg) {
		await this.shutdown(this.client.settings.update({
			restart: {
				message: await msg.sendLocale('COMMAND_REBOOT'),
				timestamp: process.hrtime.bigint(),
			}
		}).then(result => result.errors.length && this.client.emit('error', result.errors.join('\n'))));
	}

	async init() {
		const { client, client: { settings } } = this;

		// "message" needs to be awaited
		const [message, timestamp] = await Promise.all(rebootKeys.map(key => settings.fuckingResolve(key)));
		await settings.reset(rebootKeys);

		if (message) message.sendLocale('COMMAND_REBOOT_SUCCESS', [timestamp && getFriendlyDuration(timestamp)]);
		else client.emit('info', 'No restart channel');
	}

	async shutdown(waitForThis) {
		await Promise.all([
			...this.client.providers.map(provider => provider.shutdown()),
			waitForThis,
		]);
		process.exit();
	}

};
