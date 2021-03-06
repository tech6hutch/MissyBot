import { MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';
import MissyMonitor from '../lib/structures/base/MissyMonitor';

export default class extends MissyMonitor {

	constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false,
			ignoreEdits: false,
		});
	}

	async run(msg: KlasaMessage) {
		if (msg.mentions.has(this.client.user!)) this.client.ignoredChannels.delete(msg.channel.id);
	}

}
