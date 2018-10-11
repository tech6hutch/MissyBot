const assert = require('assert');
const { join } = require('path');
const { Event } = require('klasa');
const { capitalizeFirstLetter, arrayRandom, postImage } = require('../lib/util');

module.exports = class UnknownCmd extends Event {

	constructor(...args) {
		super(...args);

		this.unknownUnknown = [
			"I don't know what that means, sorry @_@",
			"I'm so confused @_@",
			"I'm too dumb, sorry XD",
			"I'm a potato!",
		];

		this.mentionRegex = null;
		this.missyRegex = null;
	}

	init() {
		const mention = `<@!?${this.client.user.id}>`;
		this.mentionRegex = new RegExp(mention);
		this.missyRegex = new RegExp(`missy|${mention}`, 'gi');
	}

	run(msg, command, prefix, prefixLength) {
		const text = msg.content.substring(prefixLength).trim().toLowerCase();

		[command] = command.match(/\b.+\b/);

		switch (command) {
			case 'missy':
			case `<@${this.client.user.id}>`:
			case `<@!${this.client.user.id}>`: {
				const whats = msg.content.match(this.missyRegex)
					.map(UnknownCmd.missiesToWhats(this.mentionRegex))
					.join(' ');
				return msg.send(`${whats}?`);
			}

			case 'marbles': return msg.send("They're nice, and all, but I seem to have lost all of mine @_@");
		}

		if (['well done', 'good job', 'good bot', 'good girl'].some(s => text.includes(s))) {
			return msg.send('Thank you! XD');
		}
		if (['not well', 'bad job', 'bad bot', 'bad girl'].some(s => text.includes(s))) {
			return msg.send(':/');
		}

		if (text.includes('love and support')) {
			const imageName = 'love-and-support.jpg';
			const image = {
				attachment: join(process.cwd(), 'assets', imageName),
				name: imageName,
			};
			return postImage(msg, image);
		}

		if (text === 'not you') return this.client.finalizers.get('notYou').ignoreChannel(msg);

		return msg.send(arrayRandom(this.unknownUnknown));
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
