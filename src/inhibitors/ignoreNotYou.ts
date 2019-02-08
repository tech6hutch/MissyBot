import { KlasaMessage, Command } from 'klasa';
import CmdHandler from '../monitors/commandHandler';
import MissyInhibitor from '../lib/structures/base/MissyInhibitor';

export default class extends MissyInhibitor {

	get prefixMention(): RegExp {
		return (this.client.monitors.get('commandHandler') as CmdHandler).prefixMention!;
	}

	async run(msg: KlasaMessage, _?: Command, { prefix = msg.prefix } = {}) {
		return prefix !== this.prefixMention && this.client.ignoredChannels.has(msg.channel.id) ?
			true :
			undefined;
	}

}
