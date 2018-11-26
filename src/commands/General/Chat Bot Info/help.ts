import { util as KlasaUtil, CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import MissyClient from '../../../lib/MissyClient';
import MissyCommand from '../../../lib/structures/MissyCommand';
import { scalarOrFirst } from '../../../lib/util/util';
import { Sendable, IndexedObj } from '../../../lib/util/types';

const { isFunction } = KlasaUtil;
type RunReturn = Promise<KlasaMessage | KlasaMessage[]>;

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['commands'],
			guarded: true,
			description: language => language.get('COMMAND_HELP_DESCRIPTION'),
			usage: '(Command:command)'
		});

		this.createCustomResolver('command', (arg, possible, message) => {
			if (!arg || arg === '') return undefined;
			return this.client.arguments.get('command').run(arg, possible, message);
		});
	}

	async run(message: KlasaMessage, [command]: [MissyCommand?]): RunReturn {
		return this.sendHelp(message, command);
	}

	async sendHelp(msg: KlasaMessage, command?: MissyCommand, toChannel: Sendable = command ? msg : <KlasaUser>msg.author, {
		doneText = msg.language.get('COMMAND_HELP_DM'),
		failText = msg.language.get('COMMAND_HELP_NODM'),
	} = {}): RunReturn {
		if (command) {
			const info = [
				`= ${command.helpListName || command.name} = `,
				isFunction(command.description) ? command.description(msg.language) : command.description,
				msg.language.get('COMMAND_HELP_USAGE', command.helpUsage || command.usage.fullUsage(msg)),
				msg.language.get('COMMAND_HELP_EXTENDED'),
				isFunction(command.extendedHelp) ? command.extendedHelp(msg.language) : command.extendedHelp
			].join('\n');
			return <RunReturn>toChannel.send(info, { code: 'asciidoc' });
		}

		const help = await this.buildHelp(msg);
		const categories = Object.keys(help);
		const helpMessage = [
			...msg.language.get('COMMAND_HELP_PREFIX_NOTE', msg.guildSettings),
		];
		for (let cat = 0; cat < categories.length; cat++) {
			helpMessage.push(`**${categories[cat]} Commands**:`, '```asciidoc');
			const subCategories = Object.keys(help[categories[cat]]);
			for (let subCat = 0; subCat < subCategories.length; subCat++) {
				helpMessage.push(`= ${subCategories[subCat]} =`, `${help[categories[cat]][subCategories[subCat]].join('\n')}\n`);
			}
			helpMessage.push('```', '\u200b');
		}

		return toChannel.send(helpMessage, { split: { char: '\u200b' } })
			.then((m: KlasaMessage) => msg.channel.type === 'dm' ? m : msg.send(doneText))
			.catch((m: KlasaMessage) => msg.channel.type === 'dm' ? m : msg.send(failText));
	}

	async buildHelp(message: KlasaMessage) {
		const help: IndexedObj<IndexedObj<string[]>> = {};

		const prefix = scalarOrFirst(this.client.options.prefix);
		const commandNames = this.client.commands.map((cmd: MissyCommand) => cmd.helpListName || cmd.name);
		const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

		await Promise.all(this.client.commands.map((command: MissyCommand) =>
			this.client.inhibitors.run(message, command, true)
				.then(() => {
					if (!help.hasOwnProperty(command.category)) help[command.category] = {};
					if (!help[command.category].hasOwnProperty(command.subCategory)) help[command.category][command.subCategory] = [];
					const description = isFunction(command.description) ? command.description(message.language) : command.description;
					help[command.category][command.subCategory].push(`${prefix} ${(command.helpListName || command.name).padEnd(longest)} :: ${description}`);
				})
				.catch(() => {
					// noop
				})
		));

		return help;
	}

}
