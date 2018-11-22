import { AssertionError } from 'assert';
import levenshtein from 'js-levenshtein';
import { GuildChannel, Client } from 'discord.js';
import { util as KlasaUtil, KlasaMessage, Language } from 'klasa';

export const { sleep, mergeDefault } = KlasaUtil;

type Indexable<T> = T[] | string;

export const DIGITS_TO_UNITS: Map<number, string> = new Map([
	[9, 's'],
	[6, 'ms'],
	[3, 'μs'],
]);

/**
 * Get the last element
 * @param indexable The value to get the last element of
 */
export function last<T>(indexable: Indexable<T>) {
	return indexable[indexable.length - 1];
}

/**
 * Get the nth-last element
 * @param indexable The value to get the nth-last element of
 * @param n The index to get from, reverse one-indexed (last element is at n = 1)
 */
export function nthLast<T>(indexable: Indexable<T>, n: number) {
	return indexable[indexable.length - n];
}

/**
 * Returns the absolute value of a BigInt (the value without regard to sign)
 * @param bigint The BigInt value
 * @returns A positive BigInt
 */
export function bigAbs(bigint: bigint): bigint {
	return bigint < 0 ? -bigint : bigint;
}

/**
 * @param string The string to capitalize
 */
export function capitalizeFirstLetter(string: string): string {
	return string.charAt(0).toUpperCase() + string.substring(1);
}

/**
 * @param arrayOrScalar Something that may or may not be an array
 * @returns Not an array (unless the array contained arrays, of course)
 */
export function scalarOrFirst<T>(arrayOrScalar: T | T[]): T {
	return Array.isArray(arrayOrScalar) ? arrayOrScalar[0] : arrayOrScalar;
}

/**
 * @param arrayOrScalar Something that may or may not be an array
 * @returns Definitely an array
 */
export function ensureArray<T>(arrayOrScalar: T[] | T): T[] {
	return Array.isArray(arrayOrScalar) ? arrayOrScalar : [arrayOrScalar];
}

/**
 * @param array An array to retrieve a random element from
 */
export function arrayRandom<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export function roundDigit([digit, otherDigit]: string) {
	return Number(digit) + +(+otherDigit >= 5);
}

/**
 * Get a duration formatted in a friendly string
 * @param from High precision number to compare from
 * @param to High precision number to compare to
 */
export function getFriendlyDuration(from: bigint, to: bigint): string {
	// @ts-ignore Bloody outdated Node.js types
	if (!to) to = process.hrtime.bigint();
	const time = bigAbs(to - from).toString();
	let shift: number | undefined, suffix: string | undefined;

	const digits = time.length;
	for (const [d, suf] of DIGITS_TO_UNITS) {
		if (digits > d) {
			shift = -d;
			suffix = suf;
			break;
		}
	}
	if (shift == null || suffix == null) throw new AssertionError();

	const whole = time.slice(0, shift);
	const fractional = `${time.slice(shift, shift + 1)}${roundDigit(time.slice(shift + 1, shift + 3))}`;
	return `${whole}.${fractional}${suffix}`;
}

/**
 * @param array An array of strings
 * @param lastSep Used to separate the last item from the previous
 * @param sep Used to separate items
 */
export function smartJoin(array: string[], lastSep = 'and', sep = ','): string {
	return arrayJoin(array, `${sep} `, `${lastSep} `);
}

/**
 * @param array An array of strings
 * @param sep Used to separate items
 * @param beforeLast Inserted before the last item
 */
export function arrayJoin(array: string[], sep = ',', beforeLast = ''): string {
	switch (array.length) {
		case 0: return '';
		case 1: return String(array[0]);
		case 2: return `${array[0]} ${beforeLast}${array[1]}`;
	}
	const lastIndex = array.length - 1;
	const secondLastIndex = lastIndex - 1;
	return array.reduce(
		(joined, str, i) => joined +
			(i === lastIndex ? String(str) : `${str}${sep}${i === secondLastIndex ? beforeLast : ''}`),
		''
	);
}

/**
 * @param min Minimum (inclusive)
 * @param max Maximum (inclusive)
 */
export function randomBetween(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Finds the closest match in `sharpHaystack` for `fuzzyNeedle`
 * @param fuzzyNeedle The string to find the closest item in sharpHaystack for
 * @param sharpHaystack The iterable of strings to compare against
 * @returns The closest item in sharpHaystack to fuzzyNeedle
 */
export function fuzzySearch(fuzzyNeedle: string, sharpHaystack: Iterable<string>): string {
	fuzzyNeedle = fuzzyNeedle.toLowerCase();
	let leastDistance = Infinity;
	let closestValue;
	for (const value of sharpHaystack) {
		const distance = levenshtein(fuzzyNeedle, value.toLowerCase());
		if (distance < leastDistance) {
			leastDistance = distance;
			closestValue = value;
		}
	}
	if (closestValue == null) throw new TypeError('sharpHaystack must have length > 0');

	return closestValue;
}

/**
 * @param length How long the pause should be
 */
export function naturalPause(length: 'short' | 'medium' | 'long' = 'medium'): Promise<void> {
	return sleep({
		short: randomBetween(500, 1500),
		medium: randomBetween(1600, 2500),
		long: randomBetween(2600, 5000),
	}[length]);
}

// Discord stuff

/**
 * Resolve a Language object from a given value
 * @param obj The object to resolve a Language from
 */
export function resolveLang(obj: KlasaMessage | GuildChannel | { client: Client }): Language {
	return (<KlasaMessage>obj).language ||
		((<GuildChannel>obj).guild && (<GuildChannel>obj).guild.language) ||
		obj.client.languages.default;
}
