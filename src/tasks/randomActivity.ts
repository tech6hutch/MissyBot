import { ActivityOptions } from 'discord.js';
import {
	Task, Duration, constants,
	TaskStore,
} from 'klasa';
import MissyClient from '../lib/MissyClient';
import { randomBetween } from '../lib/util/util';

export default class extends Task {

	nextTimestamp = Infinity;
	nextAt: Date | null = null;
	timeout: NodeJS.Timer | null = null;

	constructor(client: MissyClient, store: TaskStore, file: string[], directory: string) {
		super(client, store, file, directory);
	}

	nextIn(showIn?: boolean) {
		return Duration.toNow(this.nextTimestamp, showIn);
	}

	async run(logNext = false) {
		this.scheduleNext();
		const { activity } = await this.setRandomActivity();
		const { type, name } = activity ? activity : { type: '', name: '' };
		if (logNext) this.client.console.log(`Changed activity to ${type} ${name}. Next change will occur ${this.nextIn(true)}.`);
	}

	setRandomActivity() {
		return this.client.user!.setActivity(...this.client.languages.default.getRandom<[string, ActivityOptions]>('PLAYING_ACTIVITY'));
	}

	scheduleNext(delay = constants.TIME.MINUTE * randomBetween(15, 120)) {
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

}
