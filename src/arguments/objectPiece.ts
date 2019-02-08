import { Argument, ArgumentStore, Possible, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';

export default class extends Argument {

	constructor(client: MissyClient, store: ArgumentStore, file: string[], directory: string) {
		super(client, store, file, directory, { enabled: false });
	}

	run(arg: string, possible: Possible, message: KlasaMessage) {
		// @ts-ignore cuz it doesn't exist
		const object = (<MissyClient>this.client).objects.get(arg);
		if (object) return object;
		throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'object');
	}

}
