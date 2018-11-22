import { Writable, WritableOptions } from 'stream';
import { StringDecoder, NodeStringDecoder } from 'string_decoder';
import { TextChannel } from 'discord.js';
import { SEND_CODE_LIMIT } from './util/constants';

export interface WritableOptionsPlusMissing extends WritableOptions {
	defaultEncoding?: string,
}

export abstract class MissyStream extends Writable {

	private decoder: NodeStringDecoder;
	private print: (message?: any, ...optionalParams: any[]) => void;
	private discordChannel: TextChannel | null;

	constructor(printMethod = console.log, options: WritableOptionsPlusMissing = {}) {
		super(options);

		this.decoder = new StringDecoder(options && options.defaultEncoding);
		this.print = printMethod;
		this.discordChannel = null;
	}

	setChannel(channel: TextChannel) {
		this.discordChannel = channel;
	}

	_write(chunk: Buffer | string | any, encoding: string, callback: (err: Error | null) => void) {
		(async () => {
			if (encoding === 'buffer') chunk = this.decoder.write(chunk);
			this.print(chunk);
			if (chunk.length > 0 && this.discordChannel) {
				await this.discordChannel.sendCode('', chunk.length > SEND_CODE_LIMIT ?
					`${chunk.substring(0, SEND_CODE_LIMIT - 1)}…` :
					chunk);
			}
			callback(null);
		})().catch(callback);
	}

};

export class MissyStdoutStream extends MissyStream {

	constructor(options?: WritableOptionsPlusMissing) {
		super(console.log, options);
	}

}

export class MissyStderrStream extends MissyStream {

	constructor(options?: WritableOptionsPlusMissing) {
		super(console.error, options);
	}

}
