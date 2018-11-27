import { Collection } from 'discord.js';
import { KlasaMessage } from 'klasa';
import MissyFinalizer from '../lib/structures/base/MissyFinalizer';

export default class extends MissyFinalizer {

	watchedChannels: Map<string, Promise<Collection<string, KlasaMessage>>> = new Map();
	regex = /not you(,? ?missy)?/i;
	mentionsRegex = /<[@!&#a-z\d:_-]+>/gi;

	async run(msg: KlasaMessage) {
		const channelID = msg.channel.id;

		const notYouPromise = msg.channel.awaitMessages(
			(m: KlasaMessage) => {
				const match = this.regex.exec(m.content.replace(this.mentionsRegex, ''));
				return !!match && match[0].length + 5 >= m.content.length;
			},
			{ max: 1, time: 10000, errors: ['time'] }
		) as Promise<Collection<string, KlasaMessage>>;
		// This will overwrite the current one for the channel, if any
		this.watchedChannels.set(channelID, notYouPromise);

		const notYou = await notYouPromise
			// Make sure it's still the most recent "not you" collector for the channel
			.then(() => notYouPromise === this.watchedChannels.get(channelID))
			.catch(() => false);
		if (notYou) this.ignoreChannel(msg);
	}

	ignoreChannel(msg: KlasaMessage) {
		this.client.ignoredChannels.add(msg.channel.id);
		return msg.channel.sendRandom('FINALIZER_NOTYOU');
	}

}
