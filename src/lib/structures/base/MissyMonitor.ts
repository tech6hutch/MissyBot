import {
	Monitor,
	MonitorStore, MonitorOptions,
} from 'klasa';
import MissyClient from '../../MissyClient';
import { assertEqual } from '../../util/util';

export default abstract class MissyMonitor extends Monitor {

	readonly client = <MissyClient>super.client;

	constructor(client: MissyClient, store: MonitorStore, file: string[], directory: string, options?: MonitorOptions) {
		super(client, store, file, directory, options);

		assertEqual(client, super.client, this.client);
	}

}
