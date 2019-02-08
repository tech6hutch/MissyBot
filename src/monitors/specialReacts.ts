import { MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';
import MissyMonitor from '../lib/structures/base/MissyMonitor';

export default class extends MissyMonitor {

	// Only has a word boundary at the beginning so it matches e.g. "pooping"
	missyPoopRegex = /\bpoop/i;

	constructor(client: MissyClient, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, { ignoreOthers: false });
	}

	run(msg: KlasaMessage) {
		if (msg.author === this.client.missy) {
			if (this.missyPoopRegex.test(msg.content)) return msg.react('💩');
		}
		return null;
	}

}
