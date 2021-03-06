import { CommandStore, KlasaMessage } from 'klasa';
import { mergeDefault, getAboveUser } from '../util/util';
import MissyCommand, { MissyCommandOptions } from './base/MissyCommand';

export default class InteractionCommand extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string, options?: MissyCommandOptions) {
		options = mergeDefault({
			description: lang => lang.get(`COMMAND_${this.name.toUpperCase()}_DESCRIPTION`),
			extendedHelp: lang => lang.get(`COMMAND_INTERACTION_EXTENDEDHELP`),
			usage: '[user:user]',
		} as MissyCommandOptions, options);

		super(store, file, directory, options);
	}

	static subclass(options: MissyCommandOptions) {
		return class extends InteractionCommand {
			constructor(store: CommandStore, file: string[], directory: string) {
				super(store, file, directory, options);
			}
		};
	}

	run(msg: KlasaMessage, [user = getAboveUser(msg)]) {
		return msg.sendLocale(`COMMAND_${this.name.toUpperCase()}`, [user]);
	}

}
