require('./preload');

const { Permissions: { FLAGS } } = require('discord.js');
const { KlasaClient, Schema, PermissionLevels, util: { mergeDefault } } = require('klasa');
const { MissyStdoutStream, MissyStderrStream } = require('./MissyStreams');
const AssetStore = require('./structures/AssetStore');
// const ObjectStore = require('./structures/ObjectStore');
const profanity = require('./profanity');

module.exports = class MissyClient extends KlasaClient {

	constructor(options = {}) {
		options = mergeDefault({
			// KlasaClientOptions
			prefix: ['Missy,', 'Missy'],
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

		if (!options.gateways.clientStorage.schema) {
			options.gateways.clientStorage.schema = new Schema()
				// Default
				.add('userBlacklist', 'user', { array: true, configurable: true })
				.add('guildBlacklist', 'guild', { array: true, configurable: true })
				.add('schedules', 'any', { array: true, configurable: false })
				// Custom
				.add('restart', folder => folder
					.add('message', 'messagepromise')
					.add('timestamp', 'bigint', { min: 0 }));
		}

		if (!options.gateways.users.schema) {
			options.gateways.users.schema = new Schema()
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
			options.permissionLevels = new PermissionLevels()
				.add(0, () => true)
				.add(6, (_, msg) => msg.guild && msg.member.permissions.has(FLAGS.MANAGE_GUILD), { fetch: true })
				.add(7, (_, msg) => msg.guild && msg.member === msg.guild.owner, { fetch: true })
				.add(8, (client, msg) => client.speakerIDs.has(msg.author.id))
				.add(9, (client, msg) => msg.author === client.owner || msg.author === client.missy, { break: true })
				.add(10, (client, msg) => msg.author === client.owner);
		}

		super(options);

		this.COLORS = {
			WHITE: 0xFFFFFF,
			BLACK: 0x000000,
			BLUE: 0x0000FF,
		};

		this.missyID = '398127472564240387';

		/**
		 * People who can speak for the bot (use, e.g., the "say" command)
		 *
		 * See the once "ready" event, below, for the rest of the elements in this set.
		 */
		this.speakerIDs = new Set([this.missyID]);

		/**
		 * Channels ignored as part of the "not you" system
		 */
		this.ignoredChannels = new Set();

		this.assets = new AssetStore(this);
		this.registerStore(this.assets);
		// this.objects = new ObjectStore(this);
		// this.registerStore(this.objects);

		this.once('ready', () => {
			this.users.fetch(this.missyID)
				.catch(e => this.emit('wtf', ["Missy wasn't found:", e]));
			const moonbeamID = '214442156788678658';
			this.users.fetch(moonbeamID)
				.then(() => this.speakerIDs.add(moonbeamID))
				.catch(e => this.emit('wtf', ["Moonbeam wasn't found:", e]));

			// Channel setup for console log and error
			const { stdout, stderr } = options.console;
			const logChannel = this.channels.get(options.missyLogChannel);
			if (logChannel) stdout.setChannel(logChannel);
			else this.console.error("Couldn't find log Discord channel");
			const errorChannel = this.channels.get(options.missyErrorChannel);
			if (errorChannel) stderr.setChannel(errorChannel);
			else this.console.error("Couldn't find error Discord channel");
		});
	}

	get missy() {
		return this.users.get(this.missyID);
	}

};
