import { KlasaMessage, Command } from 'klasa';
import MissyInhibitor from '../lib/structures/base/MissyInhibitor';

export default class extends MissyInhibitor {

	async run(msg: KlasaMessage, _?: Command, { prefix = msg.prefix } = {}) {
		return prefix !== this.client.mentionPrefix && this.client.ignoredChannels.has(msg.channel.id) ?
			true :
			undefined;
	}

}
