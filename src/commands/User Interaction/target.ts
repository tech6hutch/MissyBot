import { KlasaUser, CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import InteractionCommand from '../../lib/structures/InteractionCommand';

const thirtySeconds = 30_000;

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
			const userWasTargetingAnyone = author.stopTargeting();
			return msg.sendLocale('COMMAND_TARGET_STOP', [{ author, userWasTargetingAnyone }]);
		} else {
			const target = arg;
			author.startTargeting(target);
			const responseMsgP = msg.sendLocale('COMMAND_TARGET', [{ author, target }]);

			let startTime = Date.now();
			while (true) {
				const duration = Date.now() - startTime;
				if (duration >= thirtySeconds) {
					author.stopTargeting();
					break;
				}
				const collectedMsg = await msg.channel.awaitMessages((m: KlasaMessage) => m.author === author, {
					time: thirtySeconds - duration,
					max: 1,
				}).then(coll => coll.first());
				if (!collectedMsg) {
					author.stopTargeting();
					break;
				}
				if (collectedMsg.command && collectedMsg.command instanceof InteractionCommand) {
					startTime = Date.now();
				}
			}

			return responseMsgP;
		}
	}

}
