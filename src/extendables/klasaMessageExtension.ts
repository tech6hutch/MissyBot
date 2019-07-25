import {
	Extendable, KlasaMessage,
	ExtendableStore, CachedPrefix,
} from 'klasa';
import CmdlessMsgEvent from '../events/commandlessMessage';

const shouldObeyPrefixLessCommand = (msg: KlasaMessage) =>
	msg.client.options.noPrefixDM && msg.channel.type === 'dm' ||
	CmdlessMsgEvent.shouldObeyPrefixLessCommand(msg);

export default class extends Extendable {

	constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [KlasaMessage] });
	}

	_prefixLess(this: KlasaMessage): CachedPrefix | null {
		return shouldObeyPrefixLessCommand(this) ?
			{ length: 0, regex: null! } :
			null;
	}

}
