import { CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<hugs|pats>',
			usageDelim: ' '
		});
	}

	run(msg: KlasaMessage, [gift]: ['hugs' | 'pats']): Promise<KlasaMessage> {
		return (this.store.get(gift) as MissyCommand).run(msg, []) as Promise<KlasaMessage>;
	}

}
