import { Extendable, CommandUsage, ExtendableStore, KlasaMessage } from 'klasa';
import MissyCommand from '../lib/structures/base/MissyCommand';
import { last } from '../lib/util/util';

export default class extends Extendable {

	constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [CommandUsage] });
	}

	/**
	 * Creates a full usage string including prefix and commands/aliases for documentation/help purposes
	 * @param message The message context for which to generate usage for
	 */
	fullUsage(this: CommandUsage, message: KlasaMessage): string {
		const prefix = message.localPrefix;
		const nearlyFullUsage = (message.command && (<MissyCommand>message.command).helpNearlyFullUsage) || this.nearlyFullUsage;
		return `${last(prefix) === '.' ? prefix : `${prefix} `}${nearlyFullUsage}`;
	}

}
