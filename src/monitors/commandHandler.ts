import {
	Stopwatch,
	MonitorStore, KlasaMessage, Command,
} from 'klasa';
import MissyMonitor from '../lib/structures/base/MissyMonitor';
import { IndexedObj } from '../lib/util/types';

export default class extends MissyMonitor {

	constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { ignoreOthers: false });
		this.ignoreEdits = !this.client.options.commandEditing;
	}

	async run(message: KlasaMessage) {
		if (message.guild && !message.guild.me) await message.guild.members.fetch(this.client.user!);
		if (!message.channel.postable) return undefined;

		const { commandText, prefix, prefixLength, command } = message;

		if (!commandText) return this.client.emit('commandlessMessage', message, prefix, prefixLength);

		if (!command) return this.client.emit('commandUnknown', message, commandText, prefix, prefixLength);

		this.client.emit('commandRun', message, command, message.args);
		return this.runCommand(message);
	}

	async runCommand(message: KlasaMessage) {
		const command = message.command!;
		const timer = new Stopwatch();
		if (this.client.options.typing) message.channel.startTyping();
		try {
			await this.client.inhibitors.run(message, command);
			try {
				// @ts-ignore using private method KlasaMessage#prompter
				await message.prompter.run();
				try {
					const subcommand = command.subcommands ? message.params.shift() : undefined;
					const commandRun = subcommand ?
						(<Command & IndexedObj<Command['run']>>command)[subcommand](message, message.params) :
						command.run(message, message.params);
					timer.stop();
					const response = await commandRun;
					this.client.finalizers.run(message, command, response!, timer);
					this.client.emit('commandSuccess', message, command, message.params, response);
				} catch (error) {
					this.client.emit('commandError', message, command, message.params, error);
				}
			} catch (argumentError) {
				this.client.emit('argumentError', message, command, message.params, argumentError);
			}
		} catch (response) {
			this.client.emit('commandInhibited', message, command, response);
		}
		if (this.client.options.typing) message.channel.stopTyping();
	}

}
