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
		return (this.client.options.noPrefixDM && this.channel.type === 'dm')
			|| this.author && (this.author as KlasaUser).hasTarget
			|| authorIsWatched(this)
				? { length: 0, regex: null! }
				: null;
	}

}

function authorIsWatched(msg: KlasaMessage): boolean {
	const author = msg.author as KlasaUser | null;
	if (author && msg.channel.isUserWatched(author)) {
		const watchInfo = msg.channel.getUserWatchingInfo(author)!;
		const duration = Date.now() - watchInfo.listeningSince;
		if (duration < thirtySeconds) return true;

		msg.channel.stopWatchingUser(author);
	}

	return false;
}
