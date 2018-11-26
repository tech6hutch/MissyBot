import {
	Command,
	CommandStore, CommandOptions,
} from 'klasa';
import MissyClient from '../MissyClient';

export type MissyCommandOptions = {
	helpListName?: string;
	helpUsage?: string;
} & CommandOptions;

export default class MissyCommand extends Command {

	client: MissyClient;

	helpListName: string;
	helpUsage: string;

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string, options: MissyCommandOptions = {}) {
		super(client, store, file, directory, options);

		this.helpListName = options.helpListName || this.name;
		this.helpUsage = options.helpUsage || this.usage.nearlyFullUsage;
	}

}
