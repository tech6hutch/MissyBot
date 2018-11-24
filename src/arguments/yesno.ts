import { Argument, Possible, KlasaMessage } from 'klasa';
import { regExpEsc } from '../lib/util/util';

const truths = new RegExp(`\\b(${
	[
		'1', 'true', '+', 't',
		'yes', 'y', 'sure', 'yeah', 'yep', 'yup',
	]
		.map(regExpEsc).join('|')
})\\b`);
const falses = new RegExp(`\\b(${
	[
		'0', 'false', '-', 'f',
		'no', 'n', 'nah',
	]
		.map(regExpEsc).join('|')
})\\b`);

export default class extends Argument {

	run(arg: string, possible: Possible, message: KlasaMessage) {
		const boolean = String(arg).toLowerCase();
		if (truths.test(boolean)) return true;
		if (falses.test(boolean)) return false;
		throw message.language.get('RESOLVER_INVALID_BOOL', possible.name);
	}

}
