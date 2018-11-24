import assert from 'assert';
import { Monitor, MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';
import profanity from '../lib/profanity';
import { IndexedObj, KlasaMessageWithUserSettings } from '../lib/util/types';

export default class extends Monitor {

	constructor(client: MissyClient, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, { ignoreOthers: false });
	}

	async run(msg: KlasaMessageWithUserSettings) {
		const obj = { profanity: {} as IndexedObj<number> };
		const keyValues = obj.profanity;
		let swears: RegExpExecArray | null;
		while ((swears = profanity.regex.exec(msg.content)) !== null) {
			for (const [i, word] of swears.entries()) {
				if (!(i && word)) continue;
				const unAliasedWord = profanity.get(word)!;
				assert(profanity.words.includes(unAliasedWord), `Unknown word: ${unAliasedWord}, resolved from ${word}`);
				keyValues[unAliasedWord] = (keyValues[unAliasedWord] || msg.author.settings.profanity[unAliasedWord]) + 1;
				assert(!isNaN(keyValues[unAliasedWord]));
			}
		}
		if (Object.keys(keyValues).length) msg.author.settings.update(obj);
	}

}
