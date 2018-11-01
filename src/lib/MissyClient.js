require('./preload');

const { KlasaClient, Schema, util: { mergeDefault } } = require('klasa');
const { MissyStdoutStream, MissyStderrStream } = require('./MissyStreams');
// const ObjectStore = require('./base/ObjectStore');
const profanity = require('./profanity');

module.exports = class MissyClient extends KlasaClient {

	constructor(options = {}) {
		options = mergeDefault({
			// KlasaClientOptions
			prefix: ['Missy,', 'Missy'],
			prefixCaseInsensitive: true,
			commandEditing: true,
			noPrefixDM: true,
			// pieceDefaults: {
			// 	objects: { enabled: true },
			// },
			gateways: {
				clientStorage: {
					schema: new Schema()
						// Default
						.add('userBlacklist', 'user', { array: true, configurable: true })
						.add('guildBlacklist', 'guild', { array: true, configurable: true })
						.add('schedules', 'any', { array: true, configurable: false })
						// Custom
						.add('restart', folder => folder
							.add('message', 'messagepromise')
							.add('timestamp', 'bigint', { min: 0 })),
				},
				users: {
					schema: new Schema()
						// No defaults
						// Custom
						.add('profanity', folder => profanity.words.forEach(word => folder
							.add(word, 'integer', {
								min: 0,
								default: 0,
								configurable: false,
							}))),
				},
			},
			console: {
				stdout: new MissyStdoutStream(),
				stderr: new MissyStderrStream(),
			},
			// Custom options
			missyLogChannel: '499959509653913600',
			missyErrorChannel: '499959529522331653',
		}, options);
		super(options);

		this.missyID = '398127472564240387';
		this.missy = null;
		this.ignoredChannels = new Set();

		// this.objects = new ObjectStore(this);
		// this.registerStore(this.objects);

		this.once('klasaReady', () => {
			this.missy = this.users.get(this.missyID);

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

};
