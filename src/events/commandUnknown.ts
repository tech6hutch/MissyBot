import { KlasaMessage } from 'klasa';
import MissyEvent from '../lib/structures/base/MissyEvent';
import CmdHandler from '../monitors/commandHandler';
import IgnoreNotYouInhibitor from '../inhibitors/ignoreNotYou';
import NotYouFinalizer from '../finalizers/notYou';
import { capitalizeFirstLetter } from '../lib/util/util';

export default class UnknownCmd extends MissyEvent {

	commandTextRegex = /\b[\w-]+\b/;
	mentionRegex: RegExp | null = null;
	missyRegex: RegExp | null = null;

	get cmdHandler(): CmdHandler {
		return this.client.monitors.get('commandHandler') as CmdHandler;
	}

	get notYou(): NotYouFinalizer {
		return this.client.finalizers.get('notYou') as NotYouFinalizer;
	}

	async run(msg: KlasaMessage, command: string, prefix: RegExp, prefixLength: number) {
		if (await this.inhibit(msg, prefix)) return undefined;

		const text = msg.content.substring(prefixLength).trim().toLowerCase();
		[command] = command.match(this.commandTextRegex) || [''];

		switch (command) {
			case 'missy':
			case `<@${this.client.user!.id}>`:
			case `<@!${this.client.user!.id}>`: {
				const whats = msg.content.match(this.missyRegex!)!
					.map(UnknownCmd.missiesToWhats(this.mentionRegex!))
					.join(' ');
				return msg.send(`${whats}?`);
			}

			case 'marbles': return msg.sendLocale('EVENT_COMMAND_UNKNOWN_MARBLES');
		}

		if (['well done', 'good job', 'good bot', 'good girl'].some(s => text.includes(s))) {
			return msg.send('Thank you! XD');
		}
		if (['not well', 'bad job', 'bad bot', 'bad girl'].some(s => text.includes(s))) {
			return msg.send(':/');
		}

		if (text.includes('love and support')) {
			return msg.sendLoading(() => this.client.assets.get('love-and-support').uploadTo(msg));
		}

		if (text.includes('fetish')) return msg.send("I don't have any fetishes @_@");

		if (text.startsWith('is a')) return msg.send("I'M A POTATO");

		if (text === 'not you') return this.notYou.ignoreChannel(msg);

		if (prefix === this.client.mentionPrefix) {
			return msg.sendRandom('EVENT_COMMAND_UNKNOWN_UNKNOWN');
		}
	}

	async inhibit(msg: KlasaMessage, prefix: RegExp): Promise<boolean> {
		return (this.client.inhibitors.get('ignoreNotYou') as IgnoreNotYouInhibitor)
			.run(msg, undefined, { prefix })
				.then((value: true | undefined) => Boolean(value));
	}

	async init() {
		require('assert')(this.client.assets.has('love-and-support'));
		const mention = `<@!?${this.client.user!.id}>`;
		this.mentionRegex = new RegExp(mention);
		this.missyRegex = new RegExp(`missy|${mention}`, 'gi');
	}

	static missiesToWhats(mentionRegex: RegExp) {
		const what = 'what';
		return (missy: string, i: number): string => mentionRegex.test(missy) ?
			(i === 0 ? capitalizeFirstLetter(what) : what) :
			what.split('').map(UnknownCmd.missyCase(missy, what)).join('');
	}

	static missyCase(missy: string, what: string) {
		const lastIndex = what.length - 1;
		return (w: string, i: number): string => {
			// For the last letter of "what", use the case of the last letter of "missy"
			const m = i === lastIndex ? missy[missy.length - 1] : missy[i];
			return m === m.toUpperCase() ? w.toUpperCase() : w;
		};
	}

}
