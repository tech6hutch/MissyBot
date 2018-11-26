import { Command, CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import { getFriendlyDuration, scalarOrFirst } from '../../lib/util/util';

const rebootKeys = ['message', 'timestamp'].map(key => `restart.${key}`);

export default class extends Command {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			permissionLevel: 10,
			guarded: true,
			description: language => language.get('COMMAND_REBOOT_DESCRIPTION')
		});
	}

	async run(msg: KlasaMessage): Promise<never> {
		const values: [KlasaMessage, number] = [
			scalarOrFirst(await msg.sendLocale('COMMAND_REBOOT')),
			Date.now(),
		];
		return this.shutdown(
			this.client.settings!.update(rebootKeys.map((key, i) => [key, values[i]]))
				.then(result => result.errors.length && this.client.emit('error', result.errors.join('\n')))
		);
	}

	async init() {
		const { client, client: { settings } } = this;

		const [message, timestamp] = await Promise.all(<[Promise<KlasaMessage>, number]>rebootKeys.map(key => settings!.fuckingResolve(key)));
		await settings!.reset(rebootKeys);

		if (message) message.sendLocale('COMMAND_REBOOT_SUCCESS', [timestamp && getFriendlyDuration(timestamp)]);
		else client.emit('info', 'No restart channel');
	}

	async shutdown(waitForThis?: Promise<any>) {
		await Promise.all([
			...this.client.providers.map(provider => provider.shutdown()),
			waitForThis,
		]);
		return process.exit();
	}

}
