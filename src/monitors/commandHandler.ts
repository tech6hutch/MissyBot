import {
	Stopwatch,
	MonitorStore, KlasaMessage, Command,
} from 'klasa';
import MissyClient from '../lib/MissyClient';
import MissyMonitor from '../lib/structures/base/MissyMonitor';
import { regExpEsc } from '../lib/util/util';
import { IndexedObj, KlasaMessageWithGuildSettings } from '../lib/util/types';

type PrefixObject = {
	length: number;
	regex: RegExp;
};

type PrefixObjectNullable = null | {
	length: number;
	regex: RegExp | null;
};

export default class extends MissyMonitor {

	commandTextRegex = /\b[\w-]+\b/;
	prefixes: Map<string, PrefixObject> = new Map();
	prefixMention: RegExp | null = null;
	mentionOnly: RegExp | null = null;
	prefixFlags = this.client.options.prefixCaseInsensitive ? 'i' : '';

	constructor(client: MissyClient, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, { ignoreOthers: false });
		this.ignoreEdits = !this.client.options.commandEditing;
	}

	async run(message: KlasaMessage) {
		if (message.guild && !message.guild.me) await message.guild.members.fetch(this.client.user!);
		if (!message.channel.postable) return undefined;

		const { commandText, prefix, prefixLength } = this.parseCommand(message as KlasaMessageWithGuildSettings);
		if (!commandText) return this.client.emit('commandlessMessage', message, prefix, prefixLength);

		const command = this.client.commands.get(commandText as string);
		if (!command) return this.client.emit('commandUnknown', message, commandText, prefix, prefixLength);

		// @ts-ignore using private method KlasaMessage#_registerCommand
		return this.runCommand(message._registerCommand({ command, prefix, prefixLength }));
	}

	parseCommand(message: KlasaMessageWithGuildSettings) {
		const result = this.naturalPrefix(message) || this.customPrefix(message) || this.mentionPrefix(message) || this.prefixLess(message);
		return result ? {
			commandText: (message.content.slice(result.length).match(this.commandTextRegex) || [''])[0].toLowerCase(),
			prefix: result.regex,
			prefixLength: result.length
		} : { commandText: false };
	}

	customPrefix({ content, guildSettings: { prefix } }: KlasaMessageWithGuildSettings): PrefixObjectNullable {
		if (!prefix) return null;
		for (const prf of Array.isArray(prefix) ? prefix : [prefix]) {
			const testingPrefix = this.prefixes.get(prf) || this.generateNewPrefix(prf);
			if (testingPrefix.regex.test(content)) return testingPrefix;
		}
		return null;
	}

	mentionPrefix({ content }: KlasaMessage): PrefixObjectNullable {
		const prefixMention = this.prefixMention!.exec(content);
		return prefixMention ? { length: prefixMention[0].length, regex: this.prefixMention! } : null;
	}

	naturalPrefix({ content, guildSettings: { disableNaturalPrefix } }: KlasaMessageWithGuildSettings): PrefixObjectNullable {
		if (disableNaturalPrefix || !this.client.options.regexPrefix) return null;
		const results = this.client.options.regexPrefix.exec(content);
		return results ? { length: results[0].length, regex: this.client.options.regexPrefix } : null;
	}

	prefixLess({ channel: { type } }: KlasaMessage): PrefixObjectNullable {
		return this.client.options.noPrefixDM && type === 'dm' ? { length: 0, regex: null } : null;
	}

	generateNewPrefix(prefix: string): PrefixObject {
		const prefixObject = { length: prefix.length, regex: new RegExp(`^${regExpEsc(prefix)}`, this.prefixFlags) };
		this.prefixes.set(prefix, prefixObject);
		return prefixObject;
	}

	async runCommand(message: KlasaMessage) {
		const timer = new Stopwatch();
		if (this.client.options.typing) message.channel.startTyping();
		try {
			await this.client.inhibitors.run(message, message.command!);
			try {
				// @ts-ignore using private method KlasaMessage#prompter
				await message.prompter.run();
				const subcommand = message.command!.subcommands ? <string>message.params.shift() : undefined;
				const commandRun: Promise<KlasaMessage | KlasaMessage[] | null> = subcommand ?
					(<Command & IndexedObj<Command['run']>>message.command)[subcommand](message, message.params) :
					message.command!.run(message, message.params);
				timer.stop();
				const response = await commandRun;
				this.client.finalizers.run(message, message.command!, response as KlasaMessage, timer);
				this.client.emit('commandSuccess', message, message.command, message.params, response);
			} catch (error) {
				this.client.emit('commandError', message, message.command, message.params, error);
			}
		} catch (response) {
			this.client.emit('commandInhibited', message, message.command, response);
		}
		if (this.client.options.typing) message.channel.stopTyping();
	}

	async init() {
		this.prefixMention = new RegExp(`^<@!?${this.client.user!.id}>`);
		this.mentionOnly = new RegExp(`^<@!?${this.client.user!.id}>$`);
	}

}
