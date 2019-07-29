import { TextChannel, Guild } from 'discord.js';
import { KlasaMessage, Serializer, SchemaEntry, Language, KlasaUser } from 'klasa';
import { Sendable } from '../lib/util/types';

export default class MsgSerializer extends Serializer {

	async deserialize(data: any, entry: SchemaEntry, language: Language, guild: Guild): Promise<KlasaMessage> {
		if (data instanceof KlasaMessage) return data;
		if (typeof data !== 'string') throw MsgSerializer.error(language, entry.key);
		const [channelID, messageID] = data.split('/', 2);
		if (!(channelID && messageID)) throw MsgSerializer.error(language, entry.key);

		const channel: TextChannel = await this.client.serializers.get('channel').deserialize(channelID,
			{ key: entry.key, type: 'textchannel' } as SchemaEntry,
			language, guild);
		const messagePromise = MsgSerializer.regex.snowflake.test(messageID) ?
			channel.messages.fetch(messageID) as Promise<KlasaMessage> :
			null;
		if (messagePromise) return messagePromise;
		// Yes, the split is supposed to be text, not code
		throw language.get('RESOLVER_INVALID_MESSAGE', `${entry.key}.split('/')[1]`);
	}

	serialize(data: KlasaMessage): string {
		return `${data.channel.id}/${data.id}`;
	}

	// @ts-ignore I had to add an arg
	stringify(data: any, channel: Sendable): string {
		// channel might be a message, I sure as heck don't know
		const maybeMsg = (
			channel instanceof KlasaMessage ? channel.channel :
			channel instanceof KlasaUser ? channel.dmChannel :
			channel
		).messages.get(data);
		return maybeMsg ||
			data && data.content ||
			data;
	}

	static error(language: Language, name: string) {
		// Yes, the split is supposed to be text, not code
		return [
			language.get('RESOLVER_INVALID_CHANNEL', `${name}.split('/')[0]`),
			language.get('RESOLVER_INVALID_MESSAGE', `${name}.split('/')[1]`)
		].join(' ');
	}

}
