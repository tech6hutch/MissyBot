import { Finalizer, KlasaMessage, Command } from 'klasa';

export default class extends Finalizer {

	async run(message: KlasaMessage, command: Command) {
		if (message.flags.delete && !command.deletable) {
			if (message.deletable) return message.delete() as Promise<KlasaMessage>;
			else if (message.reactable) return message.react('⛔');
			else return message.author.sendLocale('FINALIZER_DELETE_FLAG_NO_DELETE');
		}
		return undefined;
	}

}
