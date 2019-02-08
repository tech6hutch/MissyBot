import { TextChannel } from 'discord.js';
import { KlasaMessage, Serializer, SchemaPiece, Language, KlasaGuild, KlasaUser } from 'klasa';
import { Sendable } from '../lib/util/types';

export default class MsgPSerializer extends Serializer {

	async deserialize(data: any, piece: SchemaPiece, language: Language, guild: KlasaGuild): Promise<KlasaMessage> {
		if (data instanceof KlasaMessage) return data;
		if (typeof data !== 'string') throw MsgPSerializer.error(language, piece.key);
		const [channelID, messageID] = data.split('/', 2);
		if (!(channelID && messageID)) throw MsgPSerializer.error(language, piece.key);

		const channel: TextChannel = await this.client.serializers.get('channel').deserialize(channelID,
			{ key: piece.key, type: 'textchannel' } as SchemaPiece,
			language, guild);
		const messagePromise = MsgPSerializer.regex.snowflake.test(messageID) ?
			channel.messages.fetch(messageID) as Promise<KlasaMessage> :
			null;
		if (messagePromise) return messagePromise;
		// Yes, the split is supposed to be text, not code
		throw language.get('RESOLVER_INVALID_MESSAGE', `${piece.key}.split('/')[1]`);
	}

	serialize(data: KlasaMessage): string {
		return `${data.channel.id}/${data.id}`;
	}

	// @ts-ignore I had to add an arg
	stringify(data: any, channel: Sendable): string {
		// channel might be a message, I sure as heck don't know
		return (
			(channel instanceof KlasaMessage ?
				channel.channel :
				channel instanceof KlasaUser ?
					channel.dmChannel :
					channel).messages.get(data) ||
			{ content: (data && data.content) || data }
		).content;
	}

	static error(language: Language, name: string) {
		// Yes, the split is supposed to be text, not code
		return [
			language.get('RESOLVER_INVALID_CHANNEL', `${name}.split('/')[0]`),
			language.get('RESOLVER_INVALID_MESSAGE', `${name}.split('/')[1]`)
		].join(' ');
	}

}
