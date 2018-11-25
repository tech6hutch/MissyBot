import { MessageReaction } from 'discord.js';
import { Event, KlasaUser } from 'klasa';
import MissyClient from '../lib/MissyClient';

export default class extends Event {

	client: MissyClient;

	run(reaction: MessageReaction, user: KlasaUser) {
		const { message: msg } = reaction;
		return (
			msg.author === this.client.user &&
			this.client.devIDs.has(msg.author.id) &&
			reaction.emoji.name === '🗑' &&
			!msg.deleted &&
			msg.deletable
		) ?
			msg.delete({ reason: "deleted by one of the bot's devs" }) :
			null;
	}

}
