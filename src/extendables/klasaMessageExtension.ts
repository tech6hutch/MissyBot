import {
	Extendable, KlasaMessage,
	ExtendableStore, CachedPrefix, KlasaUser,
} from 'klasa';

const thirtySeconds = 30_000;

export default class extends Extendable {

	constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [KlasaMessage] });
	}

	_prefixLess(this: KlasaMessage): CachedPrefix | null {
		const prefix = { length: 0, regex: null! };
		if (this.client.options.noPrefixDM && this.channel.type === 'dm') return prefix;

		const author = this.author as KlasaUser;
		if (this.channel.isUserWatched(author)) {
			const watchInfo = this.channel.getUserWatchingInfo(author)!;
			const duration = Date.now() - watchInfo.listeningSince;
			if (duration >= thirtySeconds) this.channel.stopWatchingUser(author);
			else return prefix;
		}

		return null;
	}

}
