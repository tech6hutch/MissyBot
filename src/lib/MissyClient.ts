import './preload';

import { AssertionError } from 'assert';
import path from 'path';
import git from 'simple-git/promise';
import { Permissions, Snowflake, TextChannel } from 'discord.js';
import {
	KlasaClient, Schema, PermissionLevels,
	KlasaClientOptions, ConsoleOptions, KlasaUser,
} from 'klasa';
import MissyCommand from './structures/base/MissyCommand';
import { MissyStdoutStream, MissyStderrStream, MissyStream } from './MissyStreams';
import AssetStore from './structures/AssetStore';
// import ObjectStore from './structures/ObjectStore';
import profanity from './profanity';
import { mergeDefault } from './util/util';
import { USER_IDS } from './util/constants';

export interface MissyClientOptions extends KlasaClientOptions {
	console?: ConsoleOptions & {
		stdout?: MissyStream,
		stderr?: MissyStream,
	};
	missyLogChannel?: Snowflake;
	missyErrorChannel?: Snowflake;
}

export type UserWatchingInfo = { listeningSince: number };

const COLORS = {
	WHITE: 0xFFFFFF,
	BLACK: 0x111111,
	BLUE: 0x0074D9,
};

export default class MissyClient extends KlasaClient {

	// @ts-ignore assigned in the parent class
	options: Required<MissyClientOptions>;

	COLORS: typeof COLORS;

	readonly PREFIX: string;
	readonly PREFIX_PLAIN: string;

	/**
	 * Channels ignored as part of the "not you" system
	 */
	ignoredChannels: Set<Snowflake>;

	/**
	 * The user that each user targets, if any
	 *
	 * (See the target command)
	 */
	userTargets: WeakMap<KlasaUser, KlasaUser>;

	/**
	 * A map of channelID-userID for listening for un-prefixed commands
	 */
	watchedForUnPrefixedCommands: Map<Snowflake, UserWatchingInfo>;

	assets: AssetStore;

	git: git.SimpleGit;

	constructor(options: MissyClientOptions = {}) {
		options = mergeDefault({
			// KlasaClientOptions
			regexPrefix: /^Missy,?/i,
			prefixCaseInsensitive: true,
			commandEditing: true,
			noPrefixDM: true,
			pieceDefaults: {
				assets: { enabled: true },
			// 	objects: { enabled: true },
			},
			gateways: {
				clientStorage: {},
				users: {},
			},
			providers: {
				json: {
					baseDirectory: path.resolve(path.dirname(require.main!.filename), '../data'),
				},
			},
			console: {
				stdout: new MissyStdoutStream(),
				stderr: new MissyStderrStream(),
			},
			// Custom options
			missyLogChannel: '499959509653913600',
			missyErrorChannel: '499959529522331653',
		} as MissyClientOptions, options);

		if (!options.gateways!.clientStorage!.schema) {
			options.gateways!.clientStorage!.schema = new Schema()
				// Default
				.add('userBlacklist', 'user', { array: true, configurable: true })
				.add('guildBlacklist', 'guild', { array: true, configurable: true })
				.add('schedules', 'any', { array: true, configurable: false })
				// Custom
				.add('restart', folder => folder
					.add('message', 'message')
					.add('timestamp', 'number', { min: 0 }));
		}

		if (!options.gateways!.users!.schema) {
			options.gateways!.users!.schema = new Schema()
				// No defaults
				// Custom
				.add('profanity', folder => profanity.words.forEach(word => folder
					.add(word, 'integer', {
						min: 0,
						default: 0,
						configurable: false,
					})));
		}

		if (!options.permissionLevels) {
			const { MANAGE_GUILD } = Permissions.FLAGS;
			options.permissionLevels = new PermissionLevels()
				.add(0, () => true)
				.add(6, ({ guild, member }) => Boolean(guild && member!.permissions.has(MANAGE_GUILD)), { fetch: true })
				.add(7, ({ guild, member }) => Boolean(guild && member === guild.owner), { fetch: true })
				.add(9, ({ author, client }) => client.owners.has(author!), { break: true })
				.add(10, ({ author, client }) => client.owners.has(author!));
		}

		super(options);

		this.COLORS = COLORS;

		this.PREFIX = 'Missy,';
		this.PREFIX_PLAIN = 'Missy';

		this.ignoredChannels = new Set();
		this.userTargets = new WeakMap();
		this.watchedForUnPrefixedCommands = new Map();

		this.assets = new AssetStore(this);
		this.registerStore(this.assets);
		// this.objects = new ObjectStore(this);
		// this.registerStore(this.objects);

		this.git = git();
	}

	get invite() {
		const permissions: number = new Permissions(MissyClient.basePermissions)
			.add(...this.commands.map(command => command.requiredPermissions))
			.add(...this.commands.map(command => (command as MissyCommand).optionalPermissions || 0))
			.bitfield;
		return `https://discordapp.com/oauth2/authorize?client_id=${this.application.id}&permissions=${permissions}&scope=bot`;
	}

	get hutch() {
		return this.users.get(USER_IDS.HUTCH)! as KlasaUser;
	}

	get missy() {
		return this.users.get(USER_IDS.MISSY)! as KlasaUser;
	}

	async login(token: string): Promise<string> {
		token = await super.login(token);

		await Promise.all(Object.entries(USER_IDS).map(([name, id]) =>
			this.users.fetch(id, true)
				.catch(e => this.emit('wtf', `${name} wasn't found:\n${e}`))
		));

		// Channel setup for console log and error
		const { stdout, stderr } = this.options.console;
		if (!(stdout && stderr)) throw new AssertionError();
		const logChannel = this.channels.get(this.options.missyLogChannel);
		if (logChannel instanceof TextChannel) stdout.setChannel(logChannel);
		else this.emit('error', "Couldn't find log Discord channel");
		const errorChannel = this.channels.get(this.options.missyErrorChannel);
		if (errorChannel instanceof TextChannel) stderr.setChannel(errorChannel);
		else this.emit('error', "Couldn't find error Discord channel");

		return token;
	}

}
