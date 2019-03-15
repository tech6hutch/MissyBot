import { TextChannel, DMChannel, MessageOptions } from 'discord.js';
import Klasa, { KlasaMessage, KlasaUser, Command } from "klasa";

export type IndexedObj<T> = Record<string, T>;
export type AnyObj = IndexedObj<any>;

export type Sendable = TextChannel | DMChannel | KlasaUser | KlasaMessage;

export interface MissySendAliases {
	sendRandom(key: string, localeArgs?: any[], localeResponseArgs?: any[], options?: MessageOptions):
		Promise<KlasaMessage | KlasaMessage[]>;
	sendLoading<T = KlasaMessage>(cb: (msg: KlasaMessage) => T | Promise<T>, options?: {
		loadingText?: string,
	}): Promise<T>;
	sendLoadingFor<T = KlasaMessage>(channel: Sendable, cb: (msg: Sendable) => T | Promise<T>, options?: {
		loadingText?: string,
		doneText?: string,
	}): Promise<[KlasaMessage, T]>
}

export namespace GuildSettings {
	export type Prefix = string | string[];
	export const Prefix = 'prefix';
	export type Language = Klasa.Language;
	export const Language = 'language';
	export type DisableNaturalPrefix = boolean;
	export const DisableNaturalPrefix = 'disableNaturalPrefix';
	export type DisabledCommands = Command[];
	export const DisabledCommands = 'disabledCommands';
}

export namespace UserSettings {
	export type Profanity = IndexedObj<number>;
	export const Profanity = 'profanity';
}
