import { Monitor, MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';

export default class extends Monitor {

	client: MissyClient;

	constructor(client: MissyClient, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			ignoreOthers: false,
			ignoreEdits: false,
		});
	}

	async run(msg: KlasaMessage) {
		if (msg.mentions.has(this.client.user!)) this.client.ignoredChannels.delete(msg.channel.id);
	}

}
