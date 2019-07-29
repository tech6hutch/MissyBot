import {
	Permissions,
	PermissionResolvable,
} from 'discord.js';
import {
	Command,
	CommandStore, CommandOptions,
} from 'klasa';
import MissyClient from '../../MissyClient';

export type MissyCommandOptions = {
	/** The optional bot permissions recommended to run this command */
	optionalPermissions?: PermissionResolvable;
	/** Shown in the list and as the title for individual cmd help */
	helpListName?: string;
	/** Shown in the usage */
	helpUsageName?: string;
	/** Replaces the default usage */
	helpUsage?: string;
} & CommandOptions;

export default abstract class MissyCommand extends Command {

	// @ts-ignore assigned in the parent class
	readonly client: MissyClient;

	/** The optional bot permissions recommended to run this command */
	optionalPermissions: Permissions;
	/** Shown in the list and as the title for individual cmd help */
	helpListName: string;
	/** Replaces the default usage, if present */
	helpNearlyFullUsage: string | null;

	constructor(store: CommandStore, file: string[], directory: string, options: MissyCommandOptions = {}) {
		super(store, file, directory, options);

		// @ts-ignore using .freeze()
		this.optionalPermissions = new Permissions(options.optionalPermissions).freeze();
		this.helpListName = options.helpListName || this.name;
		this.helpNearlyFullUsage = options.helpUsage ?
			`${options.helpUsageName || this.usage.commands} ${options.helpUsage}` :
			null;
	}

}
