import { EventStore } from 'klasa';
import MissyEvent from '../lib/structures/base/MissyEvent';

export default class extends MissyEvent {

	constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true });
	}

	async run() {
		const randomActivity = this.client.tasks.get('randomActivity');
		if (randomActivity) await randomActivity.run(undefined);
	}

}
