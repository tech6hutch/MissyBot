import { MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';
import MissyMonitor from '../lib/structures/base/MissyMonitor';

export default class extends MissyMonitor {

	// Only has a word boundary at the beginning so it matches e.g. "pooping"
	missyPoopRegex = /\bpoop/i;

	lexID = '280175211737776128';

	constructor(client: MissyClient, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, { ignoreOthers: false });
	}

	async run(msg: KlasaMessage) {
		if (msg.author === this.client.missy) {
			if (msg.reactable && this.missyPoopRegex.test(msg.content)) return msg.react('💩');
		} else if (msg.author.id === this.lexID) {
			if (msg.reactable && msg.content.toLowerCase().startsWith('wife')) {
				if (!msg.channel.postable) return msg.react('👰🏽');
				return [await msg.react('👰🏽'), await msg.send('Lexi!')];
			}
		}
		return null;
	}

}
