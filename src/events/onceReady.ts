import { AssertionError } from 'assert';
import { TextChannel } from 'discord.js';
import { Event, util, EventStore } from 'klasa';
import MissyClient from '../lib/MissyClient';

export default class extends Event {

	client: MissyClient;

	constructor(client: MissyClient, store: EventStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			once: true,
			event: 'ready'
		});
	}

	async run() {
		await this.client.fetchApplication();
		if (!this.client.options.ownerID) this.client.options.ownerID = this.client.application.owner!.id;

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

		this.client.settings = this.client.gateways.clientStorage.get(this.client.user!.id, true);
		// Added for consistency with other datastores, Client#clients does not exist
		// @ts-ignore using private property "cache" (also arg mismatch for this.client @_@)
		this.client.gateways.clientStorage.cache.set(this.client.user!.id, this.client);
		await this.client.gateways.sync();

		// Init all the pieces
		await Promise.all(this.client.pieceStores
			.filter(store => !['providers', 'extendables'].includes(store.name))
			.map(store => store.init()));
		// @ts-ignore more private methods: Util#initClean
		util.initClean(this.client);
		this.client.ready = true;

		// Init the schedule
		await this.client.schedule.init();

		if (this.client.options.readyMessage !== null) {
			this.client.emit('log', util.isFunction(this.client.options.readyMessage) ?
				this.client.options.readyMessage(this.client) :
				this.client.options.readyMessage);
		}

		this.client.emit('klasaReady');
	}

}
