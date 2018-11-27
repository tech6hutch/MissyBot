import {
	Command,
	CommandStore, CommandOptions,
} from 'klasa';
import MissyClient from '../MissyClient';

export type MissyCommandOptions = {
	/** Shown in the list and as the title for individual cmd help */
	helpListName?: string;
	/** Shown in the usage */
	helpUsageName?: string;
	/** Replaces the default usage */
	helpUsage?: string;
} & CommandOptions;

export default class MissyCommand extends Command {

	readonly client: MissyClient;

	/** Shown in the list and as the title for individual cmd help */
	helpListName: string;
	/** Replaces the default usage, if present */
	helpNearlyFullUsage: string | null;

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string, options: MissyCommandOptions = {}) {
		super(client, store, file, directory, options);

		this.helpListName = options.helpListName || this.name;
		this.helpNearlyFullUsage = options.helpUsage ?
			`${options.helpUsageName || this.usage.commands} ${options.helpUsage}` :
			null;
	}

}
