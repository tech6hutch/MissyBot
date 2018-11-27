import {
	Event,
	EventStore, EventOptions,
} from 'klasa';
import MissyClient from '../../MissyClient';
import { assertEqual } from '../../util/util';

export default abstract class MissyEvent extends Event {

	readonly client = <MissyClient>super.client;

	constructor(client: MissyClient, store: EventStore, file: string[], directory: string, options?: EventOptions) {
		super(client, store, file, directory, options);

		assertEqual(client, super.client, this.client);
	}

}
