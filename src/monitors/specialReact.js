const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
		});
		// Yes I'm intentionally leaving off a second word boundary
		this.regex = /\bpoop/i;
	}

	async run(msg) {
		if (msg.author === this.client.missy) {
			if (this.regex.test(msg.content)) return msg.react('💩');
		} else if (msg.author.id === '156757401201016832') {
			// return msg.react('🍞');
			return null;
		}
		return null;
	}

};
