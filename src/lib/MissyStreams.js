const { Writable } = require('stream');
const { StringDecoder } = require('string_decoder');
const { SEND_CODE_LIMIT } = require('./util/constants');

class MissyStreams {

	static getFakeChannel() {
		return {
			async send() {
				// noop
			},
			sendCode() {
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
			if (chunk.length > 0) {
				await this._channel.sendCode('', chunk.length > SEND_CODE_LIMIT ?
					`${chunk.substring(0, SEND_CODE_LIMIT - 1)}…` :
					chunk);
			}
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
