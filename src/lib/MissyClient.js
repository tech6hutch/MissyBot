const { Client, util: { mergeDefault } } = require('klasa');
const { MissyStdoutStream, MissyStderrStream } = require('./MissyStreams');

module.exports = class MissyClient extends Client {

	constructor(options = {}) {
		options = mergeDefault({
			prefix: ['Missy,', 'Missy'],
			prefixCaseInsensitive: true,
			commandEditing: true,
			noPrefixDM: true,
			console: {
				stdout: new MissyStdoutStream(),
				stderr: new MissyStderrStream(),
			},
		}, options);
		super(options);

		if (!options.missyLogChannel) options.missyLogChannel = '499959509653913600';
		if (!options.missyErrorChannel) options.missyErrorChannel = '499959529522331653';

		this.ignoredChannels = new Set();

		this.once('klasaReady', () => {
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
