import { KlasaMessage } from 'klasa';
import CmdHandler from '../monitors/commandHandler';
import MissyInhibitor from '../lib/structures/base/MissyInhibitor';

export default class extends MissyInhibitor {

	get prefixMention(): RegExp {
		return (<CmdHandler>this.client.monitors.get('commandHandler')).prefixMention!;
	}

	async run(msg: KlasaMessage, _: unknown, { prefix = msg.prefix } = {}) {
		throw prefix !== this.prefixMention && this.client.ignoredChannels.has(msg.channel.id) ?
			true :
			undefined;
	}

}
