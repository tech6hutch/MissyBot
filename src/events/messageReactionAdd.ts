import { MessageReaction } from 'discord.js';
import { KlasaUser } from 'klasa';
import MissyEvent from '../lib/structures/base/MissyEvent';

export default class extends MissyEvent {

	run(reaction: MessageReaction, user: KlasaUser) {
		const { message: msg } = reaction;
		return (
			msg.author === this.client.user &&
			this.client.owners.has(user) &&
			reaction.emoji.name === '🗑' &&
			!msg.deleted &&
			msg.deletable
		) ?
			msg.delete({ reason: "deleted by one of the bot's devs" }) :
			null;
	}

}
