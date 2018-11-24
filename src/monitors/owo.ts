import { Monitor, MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';

export default class extends Monitor {

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
		return super.shouldRun(msg) && this.regex.test(msg.content);
	}

	run(msg: KlasaMessage) {
		return msg.react('👀');
	}

}
