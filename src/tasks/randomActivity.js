const { Task, constants: { TIME: { MINUTE } } } = require('klasa');
const { randomBetween } = require('../lib/util/util');

module.exports = class extends Task {

	async run() {
		await this.client.user.setActivity(...this.client.languages.default.getRandom('PLAYING_ACTIVITY'));

		const scheduledTask = await this.scheduleRandomly();
		this.client.console.log(`Changed activity. Next change will occur at ${scheduledTask.time}`);
	}

	scheduleRandomly() {
		return this.client.schedule.create(this.name, Date.now() + (MINUTE * randomBetween(15, 120)), {
			catchUp: false,
		});
	}

};
