import { CommandStore, KlasaMessage } from 'klasa';
import { mergeDefault, getAboveUser } from '../util/util';
import MissyClient from '../MissyClient';
import MissyCommand, { MissyCommandOptions } from './base/MissyCommand';

export default class InteractionCommand extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string, options: MissyCommandOptions) {
		options = mergeDefault({
			description: lang => lang.get(`COMMAND_${this.name.toUpperCase()}_DESCRIPTION`),
			extendedHelp: lang => lang.get(`COMMAND_INTERACTION_EXTENDEDHELP`),
			usage: '[user:user]',
		} as MissyCommandOptions, options);

		super(client, store, file, directory, options);
	}

	run(msg: KlasaMessage, [user = getAboveUser(msg)]) {
		return msg.sendRandom(`COMMAND_${this.name.toUpperCase()}`, [user]);
	}

}
