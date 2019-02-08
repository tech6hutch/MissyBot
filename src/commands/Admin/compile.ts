import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from "../../lib/MissyClient";
import MissyCommand from "../../lib/structures/base/MissyCommand";
import ExecCmd from './exec';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['c'],
			description: 'Compile this TS project, into JS.',
		});
	}

	run(msg: KlasaMessage): Promise<KlasaMessage> {
		return (<ExecCmd><MissyCommand>this.store.get('exec')).run(msg, ['tsc']);
	}

}
