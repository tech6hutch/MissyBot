import './preload';

import git from 'simple-git/promise';
import { Permissions, Snowflake } from 'discord.js';
import {
	KlasaClient, Schema, PermissionLevels,
	KlasaClientOptions, KlasaConsoleOptions,
} from 'klasa';
import { MissyStdoutStream, MissyStderrStream, MissyStream } from './MissyStreams';
import AssetStore from './structures/AssetStore';
// import ObjectStore from './structures/ObjectStore';
import profanity from './profanity';
import { mergeDefault } from './util/util';

export interface MissyClientOptions extends KlasaClientOptions {
	console?: KlasaConsoleOptions & {
		stdout?: MissyStream,
		stderr?: MissyStream,
	};
	missyLogChannel?: Snowflake;
	missyErrorChannel?: Snowflake;
}

const COLORS = {
	WHITE: 0xFFFFFF,
	BLACK: 0x111111,
	BLUE: 0x0074D9,
};

export default class MissyClient extends KlasaClient {

	options: Required<MissyClientOptions>;

	COLORS: typeof COLORS;

	PREFIX: string;
	PREFIX_PLAIN: string;

	missyID: Snowflake;
	otherIDs: {
		moonbeam: Snowflake;
	};

	/**
	 * People who can speak for the bot (use, e.g., the "say" command)
	 */
	speakerIDs: Set<Snowflake>;

	/**
	 * Developers of the bot (including Missy)
	 */
	devIDs: Set<Snowflake>;

	/**
	 * Channels ignored as part of the "not you" system
	 */
	ignoredChannels: Set<Snowflake>;

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
			console: {
				stdout: new MissyStdoutStream(),
				stderr: new MissyStderrStream(),
			},
			// Custom options
			missyLogChannel: '499959509653913600',
			missyErrorChannel: '499959529522331653',
		}, options);

		if (!options.gateways!.clientStorage!.schema) {
			options.gateways!.clientStorage!.schema = new Schema()
				// Default
				.add('userBlacklist', 'user', { array: true, configurable: true })
				.add('guildBlacklist', 'guild', { array: true, configurable: true })
				.add('schedules', 'any', { array: true, configurable: false })
				// Custom
				.add('restart', folder => folder
					.add('message', 'messagepromise')
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
				.add(6, ({ guild, member }) => guild && member.permissions.has(MANAGE_GUILD), { fetch: true })
				.add(7, ({ guild, member }) => guild && member === guild.owner, { fetch: true })
				.add(8, ({ author, client }) => client.speakerIDs.has(author.id))
				.add(9, ({ author, client }) => client.devIDs.has(author.id), { break: true })
				.add(10, ({ author, client }) => author === client.owner);
		}

		super(options);

		this.COLORS = COLORS;

		this.PREFIX = 'Missy,';
		this.PREFIX_PLAIN = 'Missy';

		this.missyID = '398127472564240387';
		this.otherIDs = {
			moonbeam: '214442156788678658',
		};

		this.speakerIDs = new Set([this.missyID, this.otherIDs.moonbeam]);
		this.devIDs = new Set([this.missyID]);

		this.ignoredChannels = new Set();

		this.assets = new AssetStore(this);
		this.registerStore(this.assets);
		// this.objects = new ObjectStore(this);
		// this.registerStore(this.objects);

		this.git = git();
	}

	get missy() {
		return this.users.get(this.missyID);
	}

};
