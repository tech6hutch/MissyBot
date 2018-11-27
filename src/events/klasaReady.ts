import { EventStore } from 'klasa';
import MissyClient from '../lib/MissyClient';
import MissyEvent from '../lib/structures/base/MissyEvent';

export default class extends MissyEvent {

	constructor(client: MissyClient, store: EventStore, file: string[], directory: string) {
		super(client, store, file, directory, { once: true });
	}

	async run() {
		const randomActivity = this.client.tasks.get('randomActivity');
		if (randomActivity) await randomActivity.run(undefined);
	}

}
