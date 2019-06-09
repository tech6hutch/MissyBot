import { Extendable, Settings, ExtendableStore, KlasaGuild, Language, SchemaPiece } from 'klasa';
import MissyClient from '../lib/MissyClient';
import { AnyObj } from '../lib/util/types';

declare module 'klasa' {
	interface Settings {
		fuckingResolve(path: string | string[], guild?: KlasaGuild, language?: Language): any;
	}
}

export default class extends Extendable {

	constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Settings] });
	}

	/**
	 * Resolve shit, until SG gets a native way to do this
	 * @param path The path of the key's value to get from this instance
	 * @param guild The guild, used to resolve
	 * @param language The language to show the message in
	 * @returns The resolved setting, or undefined if not found
	 */
	fuckingResolve(
		this: Settings,
		path: string | string[], guild?: KlasaGuild, language = guild ? guild.language : this.client.languages.default,
	): any {
		const route = typeof path === 'string' ? path.split('.') : path;
		const piece = this.gateway.schema!.get(route);
		if (!(piece && piece instanceof SchemaPiece)) throw undefined;

		let objOrData = this; // eslint-disable-line consistent-this
		for (const key of route) objOrData = (<AnyObj>objOrData)[key];

		try {
			return piece.serializer.deserialize(objOrData, piece, language, guild);
		} catch (_) {
			return undefined;
		}
	}

}
