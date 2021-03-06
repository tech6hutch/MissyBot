import { TextChannel, DMChannel, MessageOptions, Guild, GuildMember } from 'discord.js';
import Klasa, { KlasaMessage, KlasaUser, Command, SchemaFolder } from 'klasa';

export type IndexedObj<T> = Record<string, T>;
export type AnyObj = IndexedObj<any>;

export type Sendable = TextChannel | DMChannel | KlasaUser | KlasaMessage;

export type SaneMessage = KlasaMessage & {
	author: KlasaUser,
};

export type GuildMessage = SaneMessage & {
	member: GuildMember,
	guild: Guild,
};

export type SaneGuild = Guild & {
	me: GuildMember,
};

export interface MissySendAliases {
	sendLoading<T = KlasaMessage>(cb: (msg: KlasaMessage) => T | Promise<T>, options?: {
		loadingText?: string,
	}): Promise<T>;
	sendLoadingFor<T = KlasaMessage>(channel: Sendable, cb: (msg: Sendable) => T | Promise<T>, options?: {
		loadingText?: string,
		doneText?: string,
	}): Promise<[KlasaMessage, T]>;
}

export namespace ClientSettings {
	// TODO: add core settings
	export namespace Restart {
		export type Message = string;
		export const Message = 'restart.message';
		export type Timestamp = number;
		export const Timestamp = 'restart.timestamp';
	}
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
	export type Profanity = SchemaFolder;
	export const Profanity = 'profanity';
	export type ProfanityCount = number;
}
