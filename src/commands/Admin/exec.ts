// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { exec, codeBlock, scalarOrFirst } from '../../lib/util/util';
import MissyClient from '../../lib/MissyClient';

export default class extends Command {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['execute'],
			description: 'Execute commands in the terminal, use with EXTREME CAUTION.',
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:string>'
		});
	}

	run(msg: KlasaMessage, [input]: [string]) {
		return msg.sendLoading(async () => {
			const result = await exec(input, { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) : 60000 })
				.catch(error => ({ stdout: null, stderr: error }));
			const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : '';
			const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : '';
	
			return scalarOrFirst(await msg.sendMessage([output, outerr].join('\n') || 'Done. There was no output to stdout or stderr.'));
		}, { loadingText: 'Executing your command...' });
	}

}
