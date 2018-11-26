import { AssertionError } from 'assert';
import levenshtein from 'js-levenshtein';
import { GuildChannel, Client } from 'discord.js';
import { util as KlasaUtil, KlasaMessage, Language } from 'klasa';

export const { codeBlock, exec, mergeDefault, regExpEsc, sleep } = KlasaUtil;

export const DIGITS_TO_UNITS: Map<number, string> = new Map([
	[9, 's'],
	[6, 'ms'],
	[3, 'μs'],
]);

interface IndexInto {
	(indexable: string): string;
	<T>(indexable: T[]): T;
}

interface IndexIntoAt {
	(indexable: string, n: number): string;
	<T>(indexable: T[], n: number): T;
}

/**
 * Get the last element
 * @param indexable The value to get the last element of
 */
export const last: IndexInto = (indexable: any): any =>
	indexable[indexable.length - 1];

/**
 * Get the nth-last element
 * @param indexable The value to get the nth-last element of
 * @param n The index to get from, one-indexed from the end (last element is at n = 1)
 */
export const nthLast: IndexIntoAt = (indexable: any, n: number): any =>
	indexable[indexable.length - n];

/**
 * @param string The string to capitalize
 */
export const capitalizeFirstLetter = (string: string): string =>
	string.charAt(0).toUpperCase() + string.substring(1);

/**
 * @param arrayOrScalar Something that may or may not be an array
 * @returns Not an array (unless the array contained arrays, of course)
 */
export const scalarOrFirst = <T>(arrayOrScalar: T | T[]): T =>
	Array.isArray(arrayOrScalar) ? arrayOrScalar[0] : arrayOrScalar;

/**
 * @param arrayOrScalar Something that may or may not be an array
 * @returns Definitely an array
 */
export const ensureArray = <T>(arrayOrScalar: T[] | T): T[] =>
	Array.isArray(arrayOrScalar) ? arrayOrScalar : [arrayOrScalar];

/**
 * @param array An array to retrieve a random element from
 */
export const arrayRandom = <T>(array: T[]): T =>
	array[Math.floor(Math.random() * array.length)];

export const roundDigit = ([digit, otherDigit]: string) =>
	Number(digit) + +(+otherDigit >= 5);

/**
 * Get a duration formatted in a friendly string
 * @param from Number to compare from
 * @param to Number to compare to
 */
export function getFriendlyDuration(from: number, to = Date.now()): string {
	const time = Math.abs(to - from).toString();
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
export const smartJoin = (array: string[], lastSep = 'and', sep = ','): string =>
	arrayJoin(array, `${sep} `, `${lastSep} `);

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
export const randomBetween = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min;

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
export const naturalPause = (length: 'short' | 'medium' | 'long' = 'medium'): Promise<void> => sleep({
	short: randomBetween(500, 1500),
	medium: randomBetween(1600, 2500),
	long: randomBetween(2600, 5000),
}[length]);

// Discord stuff

/**
 * Resolve a Language object from a given value
 * @param obj The object to resolve a Language from
 */
export const resolveLang = (obj: KlasaMessage | GuildChannel | { client: Client }): Language =>
	(<KlasaMessage>obj).language ||
		((<GuildChannel>obj).guild && (<GuildChannel>obj).guild.language) ||
		obj.client.languages.default;
