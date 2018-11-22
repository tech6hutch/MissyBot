import {
	Command,
	KlasaClient, CommandStore, CommandOptions,
} from 'klasa';

export interface MissyCommandOptions extends CommandOptions {
	helpListName?: string;
	helpUsage?: string;
}

export default class MissyCommand extends Command {

	helpListName: string;
	helpUsage: string;

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string, options: MissyCommandOptions = {}) {
		super(client, store, file, directory, options);

		this.helpListName = options.helpListName || this.name;
		this.helpUsage = options.helpUsage || this.usage.nearlyFullUsage;
	}

}
