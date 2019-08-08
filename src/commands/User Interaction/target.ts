import { KlasaUser, CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../lib/structures/base/MissyCommand';

export default class extends MissyCommand {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<stop|target:user>',
			description: language => language.get('COMMAND_TARGET_DESCRIPTION')
		});
	}

	async run(msg: KlasaMessage, [arg]: ['stop' | KlasaUser]) {
		const author = msg.author as KlasaUser;

		if (arg === 'stop') {
			const userWasTargetingAnyone = this.client.userTargets.delete(author);
			return msg.sendLocale('COMMAND_TARGET_STOP', [{ author, userWasTargetingAnyone }]);
		} else {
			const target = arg;
			this.client.userTargets.set(author, target);
			return msg.sendLocale('COMMAND_TARGET', [{ author, target }]);
		}
	}

}
