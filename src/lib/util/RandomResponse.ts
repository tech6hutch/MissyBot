import { Snowflake, UserResolvable } from 'discord.js';
import { KlasaUser, KlasaMessage } from 'klasa';
import MissyClient from '../MissyClient';
import { arrayRandom, randomBetween } from './util';
import { USER_IDS } from './constants';

const allDigitsRegex = /^\d+$/;
/** 1 in 20 chance */
const chanceOutOf20 = () => randomBetween(1, 20) === 20;
const userResolvableOrThrow = (value: any): value is UserResolvable => {
	if (!value) throw new Error();
	return true;
};

// string[] is allowed since arrays are automatically joined with '\n'
type Value = string | string[] |
	// Messages are allowed to be returned as a no-op, if the response is handled in the function
	((...args: [KlasaUser, ...any[]]) => string | string[] | Promise<KlasaMessage | KlasaMessage[]>);

export type RandomResponseArgs = {
	everyone: Value[];
	everyoneRare?: Value[];
	self?: Value[];
	[USER_IDS.HUTCH]?: Value[];
	[USER_IDS.MISSY]?: Value[];
};

type LooseRandomResponseArgs = RandomResponseArgs & {
	[k: string]: string[];
};

export default class RandomResponse {

	private readonly client: MissyClient;
	private readonly everyone: readonly Value[];
	private readonly rare: readonly Value[] | null;
	private readonly self: readonly Value[] | null;
	private readonly userSpecific: ReadonlyMap<Snowflake, readonly Value[]> | null;

	constructor(client: MissyClient, everyone: Value[], everyoneRare: Value[] | null, self: Value[] | null, userSpecific: Map<Snowflake, Value[]> | null) {
		this.client = client;
		this.everyone = everyone;
		this.rare = everyoneRare;
		this.self = self;
		this.userSpecific = userSpecific;
	}

	static build(client: MissyClient, args: RandomResponseArgs) {
		const userIDs = Object.keys(args).filter(maybeID => allDigitsRegex.test(maybeID));
		return new RandomResponse(
			client,
			args.everyone,
			args.everyoneRare || null,
			args.self || null,
			userIDs.length === 0 ?
				null :
				new Map(userIDs.map(id => [id, (args as LooseRandomResponseArgs)[id]]))
		);
	}

	run(client: MissyClient, userResolvable: UserResolvable, ...restArgs: any[]): string | string[] | undefined {
		const userID = client.users.resolveID(userResolvable);
		const value = this.getResponse(userID);
		if (typeof value !== 'function') return value;

		const valueReturn = value(client.users.get(userID) as KlasaUser, ...restArgs);
		return typeof valueReturn === 'string' ?
			valueReturn :
			Array.isArray(valueReturn) ? valueReturn : undefined;
	}

	private getResponse(userID: Snowflake | undefined): Value {
		let responses: readonly Value[];
		if (this.self !== null && userResolvableOrThrow(userID) && this.client.user!.id === userID) {
			responses = this.self;
		} else if (this.userSpecific !== null && userResolvableOrThrow(userID) && this.userSpecific.has(userID)) {
			responses = this.userSpecific.get(userID)!;
		} else {
			responses = this.rare !== null && chanceOutOf20() ? this.rare : this.everyone;
		}
		return arrayRandom(responses);
	}

}
