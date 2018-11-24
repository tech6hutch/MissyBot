import { TextChannel, DMChannel, GroupDMChannel, MessageOptions } from 'discord.js';
import { KlasaMessage, KlasaUser, Settings, Language, Command } from "klasa";

export type IndexedObj<T> = Record<string, T>;
export type AnyObj = IndexedObj<any>;

export type Sendable = TextChannel | DMChannel | GroupDMChannel | KlasaUser | KlasaMessage;

export interface MissySendAliases {
	sendRandom(key: string, localeArgs?: any[], localeResponseArgs?: any[], options?: MessageOptions):
		Promise<KlasaMessage | KlasaMessage[]>;
	sendLoading<T = KlasaMessage>(cb: (msg: KlasaMessage) => T, options?: {
		loadingText?: string,
	}): Promise<T>;
	sendLoadingFor<T = KlasaMessage>(this: KlasaMessage, channel: Sendable, cb: (msg: Sendable) => T, options?: {
		loadingText?: string,
		doneText?: string,
	}): Promise<[KlasaMessage, T]>
}

export interface GuildSettings extends Settings {
	prefix: string;
	language: Language;
	disableNaturalPrefix: boolean;
	disabledCommands: Command[];
}

export type KlasaMessageWithGuildSettings = KlasaMessage & { guildSettings: GuildSettings };

export interface UserSettings extends Settings {
	profanity: IndexedObj<number>;
}

export type KlasaMessageWithUserSettings = KlasaMessage & { author: { settings: UserSettings } };
