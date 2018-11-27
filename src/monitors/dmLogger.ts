import { Monitor, MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';
import { Sendable } from '../lib/util/types';

export default class extends Monitor {

	logChannel: Sendable | null = null;

	constructor(client: MissyClient, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			ignoreBots: false,
			ignoreOthers: false,
			ignoreWebhooks: false,
			ignoreEdits: false,
		});
	}

	shouldRun(msg: KlasaMessage): boolean {
		return super.shouldRun(msg) && msg.channel.type === 'dm';
	}

	async run(msg: KlasaMessage) {
		const { author, content } = msg;
		const text = `${msg.edits.length > 1 ? 'Edit' : 'From'}: ${author} (${author.tag})\n${content}`;
		if (this.logChannel) return this.logChannel.send(text.substring(0, 2000));
	}

	async init() {
		this.logChannel = <Sendable>this.client.channels.get('502235589752520715') || null;
	}

}