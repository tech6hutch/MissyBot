import { Inhibitor, KlasaMessage } from 'klasa';
import CmdHandler from '../monitors/commandHandler';
import MissyClient from '../lib/MissyClient';

export default class extends Inhibitor {

	client: MissyClient;

	get prefixMention(): RegExp {
		return (<CmdHandler>this.client.monitors.get('commandHandler')).prefixMention!;
	}

	async run(msg: KlasaMessage, _: unknown, { prefix = msg.prefix } = {}) {
		throw prefix !== this.prefixMention && this.client.ignoredChannels.has(msg.channel.id) ?
			true :
			undefined;
	}

}
