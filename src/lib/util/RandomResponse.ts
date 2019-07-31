import { Snowflake, UserResolvable } from 'discord.js';
import MissyClient from '../MissyClient';
import { arrayRandom, randomBetween } from './util';
import { USER_IDS } from './constants';
import { KlasaUser } from 'klasa';

const allDigitsRegex = /^\d+$/;
/** 1 in 20 chance */
const chanceOutOf20 = () => randomBetween(1, 20) === 20;
const userResolvableOrThrow = (value: any): value is UserResolvable => {
	if (!value) throw new Error();
	return true;
};

type Value = string | ((...args: [KlasaUser, ...any[]]) => string);

export type RandomResponseArgs = {
	everyone: Value[];
	everyoneRare?: Value[];
	[USER_IDS.HUTCH]?: Value[];
	[USER_IDS.MISSY]?: Value[];
};

type LooseRandomResponseArgs = RandomResponseArgs & {
	[k: string]: string[];
};

export default class RandomResponse {

	private readonly everyone: readonly Value[];
	private readonly rare: readonly Value[] | null;
	private readonly userSpecific: ReadonlyMap<Snowflake, readonly Value[]> | null;

	constructor(everyone: Value[], everyoneRare: Value[] | null, userSpecific: Map<Snowflake, Value[]> | null) {
		this.everyone = everyone;
		this.rare = everyoneRare;
		this.userSpecific = userSpecific;
	}

	static rr(args: RandomResponseArgs) {
		const userIDs = Object.keys(args).filter(maybeID => allDigitsRegex.test(maybeID));
		return new RandomResponse(args.everyone, args.everyoneRare || null,
			userIDs.length === 0 ?
				null :
				new Map(userIDs.map(id => [id, (args as LooseRandomResponseArgs)[id]])));
	}

	run(client: MissyClient, userResolvable: UserResolvable, ...restArgs: any[]): string {
		const userID = client.users.resolveID(userResolvable);
		const value = this.getResponse(userID);
		return typeof value === 'function' ?
			value(client.users.get(userID) as KlasaUser, ...restArgs) :
			value;
	}

	private getResponse(userID: Snowflake | undefined): Value {
		const { everyone, rare, userSpecific } = this;
		return arrayRandom(
			userSpecific !== null && userResolvableOrThrow(userID) && userSpecific.has(userID) ? userSpecific.get(userID)!
			: rare !== null && chanceOutOf20() ? rare
			: everyone
		);
	}

}

export const { rr } = RandomResponse;
