import { TextChannel, DMChannel, GroupDMChannel, User, Message as DiscordMessage, MessageOptions, MessageEmbed } from 'discord.js';
import { KlasaMessage, Language as KlasaLanguage } from "klasa";

export type Sendable = TextChannel | DMChannel | GroupDMChannel | User | KlasaMessage;

export interface Language extends KlasaLanguage {
	getRandom(term: string, args: any[], elArgs: any[]): string;
}

export interface Message extends DiscordMessage {
	ask(this: Message, content: string, options: MessageOptions): Promise<KlasaMessage>;
	awaitReply(this: Message, question: string, time?: number, embed?: MessageEmbed): Promise<string | false>;
	awaitMsg(this: Message, question: string, time?: number, embed?: MessageEmbed): Promise<Message>;
}

export interface MissySendAliases {
	
}
