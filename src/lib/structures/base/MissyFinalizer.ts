import {
	Finalizer,
	FinalizerStore, FinalizerOptions,
} from 'klasa';
import MissyClient from '../../MissyClient';
import { assertEqual } from '../../util/util';

export default abstract class MissyFinalizer extends Finalizer {

	readonly client = <MissyClient>super.client;

	constructor(client: MissyClient, store: FinalizerStore, file: string[], directory: string, options?: FinalizerOptions) {
		super(client, store, file, directory, options);

		assertEqual(client, super.client, this.client);
	}

}
