import { Language } from 'klasa';
import MissyClient from '../../MissyClient';
import RandomResponse from '../../util/RandomResponse';

export default abstract class MissyLanguage extends Language {

	// @ts-ignore assigned in the parent class
	readonly client: MissyClient;

	get<T = string>(term: string, ...args: any[]): T {
		const value: T | RandomResponse = super.get(term, ...args);
		return typeof value === 'object' && value instanceof RandomResponse ?
			value.run(this.client, args[0], ...args) as any as T :
			value;
	}

}
