import { MonitorStore, KlasaMessage } from 'klasa';
import MissyMonitor from '../lib/structures/base/MissyMonitor';

export default class extends MissyMonitor {

	// Only has a word boundary at the beginning so it matches e.g. "pooping"
	missyPoopRegex = /\bpoop/i;

	constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { ignoreOthers: false });
	}

	async run(msg: KlasaMessage) {
		switch (msg.author!.id) {
			case this.client.missy.id:
				if (msg.reactable && this.missyPoopRegex.test(msg.content)) {
					return msg.react('💩');
				}
		}
		return null;
	}

}
