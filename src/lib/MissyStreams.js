const { Writable } = require('stream');
const { StringDecoder } = require('string_decoder');

class MissyStreams {

	static getFakeChannel() {
		return {
			async send() {
				// noop
			},
		};
	}

}

MissyStreams._MissyStream = class _MissyStream extends Writable {

	constructor(printMethod = console.log, options) {
		super(options);

		this._decoder = new StringDecoder(options && options.defaultEncoding);
		this._print = printMethod;
		this._channel = MissyStreams.getFakeChannel();
	}

	setChannel(channel) {
		this._channel = channel;
	}

	_write(chunk, encoding, callback) {
		(async () => {
			if (encoding === 'buffer') chunk = this._decoder.write(chunk);
			this._print(chunk);
			await this._channel.send(chunk);
			callback();
		})().catch(err => callback(err));
	}

};

MissyStreams.MissyStdoutStream = class MissyStdoutStream extends MissyStreams._MissyStream {

	constructor(options) {
		super(console.log, options);
	}

};

MissyStreams.MissyStderrStream = class MissyStderrStream extends MissyStreams._MissyStream {

	constructor(options) {
		super(console.error, options);
	}

};

module.exports = MissyStreams;
