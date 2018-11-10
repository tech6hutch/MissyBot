const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { once: true });
	}

	async run() {
		const randomActivity = this.client.tasks.get('randomActivity');
		if (randomActivity) await randomActivity.run(true);
	}

};
