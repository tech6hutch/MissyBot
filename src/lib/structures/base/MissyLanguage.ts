import {
	Language,
	LanguageStore, LanguageOptions,
} from 'klasa';
import MissyClient from '../../MissyClient';
import { assertEqual } from '../../util/util';

export default abstract class MissyLanguage extends Language {

	readonly client = <MissyClient>super.client;

	constructor(client: MissyClient, store: LanguageStore, file: string[], directory: string, options?: LanguageOptions) {
		super(client, store, file, directory, options);

		assertEqual(client, super.client, this.client);
	}

}
