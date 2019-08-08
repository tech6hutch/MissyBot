import { KlasaMessage, KlasaUser } from 'klasa';
import MissyFinalizer from '../lib/structures/base/MissyFinalizer';

export default class extends MissyFinalizer {

	async run(msg: KlasaMessage) {
		msg.channel.stopWatchingUser(msg.author as KlasaUser);
	}

}
