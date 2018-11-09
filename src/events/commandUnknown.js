const { Event } = require('klasa');
const { capitalizeFirstLetter } = require('../lib/util/util');

module.exports = class UnknownCmd extends Event {

	constructor(...args) {
		super(...args);

		this.commandTextRegex = /\b[\w-]+\b/;
		this.mentionRegex = null;
		this.missyRegex = null;
	}

	async run(msg, command, prefix, prefixLength) {
		if (await this.client.inhibitors.get('ignoreNotYou').run(msg, null, { prefix })) return undefined;

		const text = msg.content.substring(prefixLength).trim().toLowerCase();
		[command] = command.match(this.commandTextRegex) || [''];

		switch (command) {
			case 'missy':
			case `<@${this.client.user.id}>`:
			case `<@!${this.client.user.id}>`: {
				const whats = msg.content.match(this.missyRegex)
					.map(UnknownCmd.missiesToWhats(this.mentionRegex))
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

		if (text.startsWith('is a')) return msg.send("I'M A POTATO");

		if (text === 'not you') return this.client.finalizers.get('notYou').ignoreChannel(msg);

		return msg.sendRandom('EVENT_COMMAND_UNKNOWN_UNKNOWN');
	}

	init() {
		require('assert')(this.client.assets.has('love-and-support'));
		const mention = `<@!?${this.client.user.id}>`;
		this.mentionRegex = new RegExp(mention);
		this.missyRegex = new RegExp(`missy|${mention}`, 'gi');
	}

	static missiesToWhats(mentionRegex) {
		const what = 'what';
		return (missy, i) => mentionRegex.test(missy) ?
			(i === 0 ? capitalizeFirstLetter(what) : what) :
			what.split('').map(UnknownCmd.missyCase(missy, what)).join('');
	}

	static missyCase(missy, what) {
		const lastIndex = what.length - 1;
		return (w, i) => {
			// For the last letter of "what", use the case of the last letter of "missy"
			const m = i === lastIndex ? missy[missy.length - 1] : missy[i];
			return m === m.toUpperCase() ? w.toUpperCase() : w;
		};
	}

};
