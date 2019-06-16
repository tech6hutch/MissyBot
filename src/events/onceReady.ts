import { AssertionError } from 'assert';
import { TextChannel } from 'discord.js';
import { util, EventStore, Settings } from 'klasa';
import MissyEvent from '../lib/structures/base/MissyEvent';

let retries = 0;

export default class extends MissyEvent {

	constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: true,
			event: 'ready'
		});
	}

	async run(): Promise<boolean> {
		try {
			await this.client.fetchApplication();
		} catch (err) {
			if (++retries === 3) return process.exit();
			this.client.emit('warning', `Unable to fetchApplication at this time, waiting 5 seconds and retrying. Retries left: ${retries - 3}`);
			await util.sleep(5000);
			return this.run();
		}

		// Single owner for now until Teams Support is truly added
		if (!this.client.options.owners.length) this.client.options.owners.push(this.client.application.owner!.id);

		this.client.mentionPrefix = new RegExp(`^<@!?${this.client.user!.id}>`);

		this.client.users.fetch(this.client.missyID)
			.catch(e => this.client.emit('wtf', ["Missy wasn't found:", e].join('\n')));
		this.client.users.fetch(this.client.otherIDs.moonbeam)
			.catch(e => this.client.emit('wtf', ["Moonbeam wasn't found:", e].join('\n')));

		// Channel setup for console log and error
		const { stdout, stderr } = this.client.options.console;
		if (!(stdout && stderr)) throw new AssertionError();
		const logChannel = this.client.channels.get(this.client.options.missyLogChannel);
		if (logChannel instanceof TextChannel) stdout.setChannel(logChannel);
		else this.client.emit('error', "Couldn't find log Discord channel");
		const errorChannel = this.client.channels.get(this.client.options.missyErrorChannel);
		if (errorChannel instanceof TextChannel) stderr.setChannel(errorChannel);
		else this.client.emit('error', "Couldn't find error Discord channel");

		const clientStorage = this.client.gateways.get('clientStorage')!;
		// Added for consistency with other datastores, Client#clients does not exist
		// @ts-ignore using private property "cache"
		clientStorage.cache.set(this.client.user!.id, this.client as Record<string, any> & { settings: Settings; });
		this.client.settings = clientStorage.create(this.client, this.client.user!.id);
		await this.client.gateways.sync();

		// Init the schedule
		await this.client.schedule.init();

		// Init all the pieces
		await Promise.all(this.client.pieceStores
			.filter(store => !['providers', 'extendables'].includes(store.name))
			.map(store => store.init()));
		// @ts-ignore more private methods: Util#initClean
		util.initClean(this.client);
		this.client.ready = true;

		if (this.client.options.readyMessage !== null) {
			this.client.emit('log', util.isFunction(this.client.options.readyMessage) ?
				this.client.options.readyMessage(this.client) :
				this.client.options.readyMessage);
		}

		return this.client.emit('klasaReady');
	}

}
