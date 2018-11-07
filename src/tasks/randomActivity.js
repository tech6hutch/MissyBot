const { Task, Duration, constants: { TIME: { MINUTE } } } = require('klasa');
const { randomBetween } = require('../lib/util/util');

module.exports = class extends Task {

	constructor(...args) {
		super(...args);
		this.timeout = null;
	}

	async run() {
		this._clearTimeout();
		const { type, name } = (await this.setRandomActivity()).activity;
		this.client.console.log(`Changed activity to ${
			type} ${name
		}. Next change will occur ${
			Duration.toNow(Date.now() + this.scheduleNext(), true)
		}.`);
	}

	setRandomActivity() {
		return this.client.user.setActivity(...this.client.languages.default.getRandom('PLAYING_ACTIVITY'));
	}

	scheduleNext(delay = MINUTE * randomBetween(15, 120)) {
		this._clearTimeout();
		this.timeout = this.client.setTimeout(() => this.run(), delay);
		return delay;
	}

	_clearTimeout() {
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = null;
	}

};
