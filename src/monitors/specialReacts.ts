import { MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';
import MissyMonitor from '../lib/structures/base/MissyMonitor';

export default class extends MissyMonitor {

	// Only has a word boundary at the beginning so it matches e.g. "pooping"
	missyPoopRegex = /\bpoop/i;
	// Why did I agree to this
	lexWifeRegex = /\b(wife|waifu)/i;

	lexID = '280175211737776128';

	constructor(client: MissyClient, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, { ignoreOthers: false });
	}

	async run(msg: KlasaMessage) {
		switch (msg.author.id) {
			case this.client.missyID:
				if (msg.reactable && this.missyPoopRegex.test(msg.content)) {
					return msg.react('💩');
				}
			case this.lexID:
				if (msg.reactable && this.lexWifeRegex.test(msg.content)) {
					msg.react('👰🏽');
					return msg.send('Lexi!');
				}
		}
		return null;
	}

}
