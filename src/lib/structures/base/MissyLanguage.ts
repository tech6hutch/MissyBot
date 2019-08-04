import { Language } from 'klasa';
import MissyClient from '../../MissyClient';
import RandomResponse, { RandomResponseArgs } from '../../util/RandomResponse';
import { IndexedObj } from '../../util/types';

export type Value =
	| string | string[]
	| ((...args: any[]) => string | string[])
	| RandomResponse;

export default abstract class MissyLanguage extends Language {

	// @ts-ignore assigned in the parent class
	readonly client: MissyClient;
	// @ts-ignore same
	language: IndexedObj<Value>;

	/** A shortcut for constructing a RandomResponse instance */
	protected rr = (args: RandomResponseArgs) => RandomResponse.build(this.client, args);

	get<T = string>(term: string, ...args: any[]): T {
		const value: T | RandomResponse = super.get(term, ...args);
		return typeof value === 'object' && value instanceof RandomResponse ?
			value.run(this.client, args[0], ...args) as any as T :
			value;
	}

}
