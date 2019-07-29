import { CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import { getFriendlyDuration, scalarOrFirst } from '../../lib/util/util';
import { ClientSettings } from '../../lib/util/types';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			permissionLevel: 10,
			guarded: true,
			description: language => language.get('COMMAND_REBOOT_DESCRIPTION')
		});
	}

	async run(msg: KlasaMessage): Promise<never> {
		const { Restart } = ClientSettings;
		return this.shutdown(
			this.client.settings!.update([
				[Restart.Message, scalarOrFirst(await msg.sendLocale('COMMAND_REBOOT'))],
				[Restart.Timestamp, Date.now()],
			])
				.then(({ errors }) => { if (errors.length) this.client.emit('error', errors.join('\n')); })
		);
	}

	async init() {
		const { client, client: { settings } } = this;

		const { Restart } = ClientSettings;
		const [message, timestamp] = await settings!
			.resolve(Restart.Message, Restart.Timestamp)
			.catch(() => [null, null]) as
			[KlasaMessage | null, number | null];

		await settings!.reset([Restart.Message, Restart.Timestamp]);

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
