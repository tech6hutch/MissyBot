import assert from 'assert';
import { MonitorStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';
import MissyMonitor from '../lib/structures/base/MissyMonitor';
import profanity from '../lib/profanity';
import { IndexedObj, UserSettings } from '../lib/util/types';

export default class extends MissyMonitor {

	constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { ignoreOthers: false });
	}

	async run(msg: KlasaMessage) {
		const obj = { profanity: {} as IndexedObj<number> };
		const keyValues = obj.profanity;
		let swears: RegExpExecArray | null;
		while ((swears = profanity.regex.exec(msg.content)) !== null) {
			for (const [i, word] of swears.entries()) {
				if (!(i && word)) continue;
				const unAliasedWord = profanity.get(word)!;

				assert(profanity.words.includes(unAliasedWord), `Unknown word: ${unAliasedWord}, resolved from ${word}`);

				keyValues[unAliasedWord] = (
					keyValues[unAliasedWord] ||
					msg.author!.settings.get(`${UserSettings.Profanity}.${unAliasedWord}`) as UserSettings.ProfanityCount
				) + 1;

				assert(!isNaN(keyValues[unAliasedWord]));
			}
		}

		if (Object.keys(keyValues).length) msg.author!.settings.update(obj);
	}

}
