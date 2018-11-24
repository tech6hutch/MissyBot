import { Extendable, CommandUsage, ExtendableStore, KlasaMessage } from 'klasa';
import MissyClient from '../lib/MissyClient';
import { last } from '../lib/util/util';

export default class extends Extendable {

	constructor(client: MissyClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [CommandUsage] });
	}

	/**
	 * Creates a full usage string including prefix and commands/aliases for documentation/help purposes
	 * @param message The message context for which to generate usage for
	 */
	fullUsage(this: CommandUsage, message: KlasaMessage): string {
		const prefix = message.localPrefix;
		return `${last(prefix) === '.' ? prefix : `${prefix} `}${this.nearlyFullUsage}`;
	}

}