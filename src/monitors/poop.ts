import { KlasaMessage } from 'klasa';
import MissyMonitor from '../lib/structures/base/MissyMonitor';

export default class extends MissyMonitor {

	// Only has a word boundary at the beginning so it matches e.g. "pooping"
	regex = /\bpoop/i;

	shouldRun({ author, content }: KlasaMessage): boolean {
		return author === this.client.missy && this.regex.test(content);
	}

	run(msg: KlasaMessage) {
		return msg.react('💩');
	}

}
