import { Extendable, Language, KlasaClient, ExtendableStore } from 'klasa';
import { arrayRandom } from '../lib/util/util';

declare module 'klasa' {
	export interface Language {
		getRandom<T = string>(term: string, args?: any[], elArgs?: any[]): T;
	}
}

export default class extends Extendable {

	constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		// @ts-ignore because Language is abstract and it doesn't like that
		super(client, store, file, directory, { appliesTo: [Language] });
	}

	/**
	 * Get a random element from a language term array
	 * @param term The string or function to look up
	 * @param args Any arguments to pass to the lookup
	 * @param elArgs Any arguments to pass to the random result
	 */
	getRandom<T = string>(this: Language, term: string, args: any[] = [], elArgs: any[] = []): T {
		const value = arrayRandom(this.get(term, ...args));
		return typeof value === 'function' ? value(...elArgs) : value;
	}

};
