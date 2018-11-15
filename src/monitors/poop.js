const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args);
		// Yes I'm intentionally leaving off a second word boundary
		this.regex = /\bpoop/i;
	}

	shouldRun({ author }) {
		return author === this.client.missy;
	}

	async run(msg) {
		if (this.regex.test(msg.content)) msg.react('💩');
	}

};
