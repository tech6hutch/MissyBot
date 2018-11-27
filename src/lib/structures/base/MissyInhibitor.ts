import {
	Inhibitor,
	InhibitorStore, InhibitorOptions,
} from 'klasa';
import MissyClient from '../../MissyClient';
import { assertEqual } from '../../util/util';

export default abstract class MissyInhibitor extends Inhibitor {

	readonly client = <MissyClient>super.client;

	constructor(client: MissyClient, store: InhibitorStore, file: string[], directory: string, options?: InhibitorOptions) {
		super(client, store, file, directory, options);

		assertEqual(client, super.client, this.client);
	}

}
