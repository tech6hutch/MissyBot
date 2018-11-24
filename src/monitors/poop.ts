import { Monitor, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';

export default class extends Monitor {

	client: MissyClient;

	// Only has a word boundary at the beginning so it matches e.g. "pooping"
	regex = /\bpoop/i;

	shouldRun({ author, content }: KlasaMessage): boolean {
		return author === this.client.missy && this.regex.test(content);
	}

	run(msg: KlasaMessage) {
		return msg.react('💩');
	}

}
