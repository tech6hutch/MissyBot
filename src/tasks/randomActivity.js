const { Task, Duration, constants: { TIME: { MINUTE } } } = require('klasa');
const { randomBetween } = require('../lib/util/util');

module.exports = class extends Task {

	constructor(...args) {
		super(...args);
		this.nextTimestamp = Infinity;
		this.nextAt = null;
		this.timeout = null;
	}

	nextIn(showIn) {
		return Duration.toNow(this.nextTimestamp, showIn);
	}

	async run(logNext = false) {
		this.scheduleNext();
		const { activity: { type, name } } = await this.setRandomActivity();
		if (logNext) this.client.console.log(`Changed activity to ${type} ${name}. Next change will occur ${this.nextIn(true)}.`);
	}

	setRandomActivity() {
		return this.client.user.setActivity(...this.client.languages.default.getRandom('PLAYING_ACTIVITY'));
	}

	scheduleNext(delay = MINUTE * randomBetween(15, 120)) {
		this._clearTimeout();
		this.nextTimestamp = Date.now() + delay;
		this.nextAt = new Date(this.nextTimestamp);
		this.timeout = this.client.setTimeout(() => this.run(), this.nextTimestamp - Date.now());
	}

	_clearTimeout() {
		if (this.timeout) clearTimeout(this.timeout);
		this.nextTimestamp = Infinity;
		this.nextAt = null;
		this.timeout = null;
	}

	reload() {
		return super.reload().finally(() => this._clearTimeout());
	}

	unload() {
		this._clearTimeout();
		return super.unload();
	}

	disable() {
		this._clearTimeout();
		return super.disable();
	}

};
