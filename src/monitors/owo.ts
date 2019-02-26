import { MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';
import MissyMonitor from '../lib/structures/base/MissyMonitor';

export default class extends MissyMonitor {

	regex = /\b[ou]w[ou]\b/i;

	constructor(client: MissyClient, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			ignoreBots: false,
			ignoreSelf: false,
			ignoreOthers: false,
			ignoreWebhooks: false,
			ignoreEdits: false,
		});
	}

	shouldRun(msg: KlasaMessage): boolean {
		return super.shouldRun(msg) && this.regex.test(msg.content) && msg.reactable;
	}

	run(msg: KlasaMessage) {
		return msg.react('👀');
	}

}
