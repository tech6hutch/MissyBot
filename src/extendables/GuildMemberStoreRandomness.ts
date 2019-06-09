import { GuildMemberStore, GuildMember, TextChannel } from 'discord.js';
import { Extendable, KlasaClient, ExtendableStore } from 'klasa';

declare module 'discord.js' {
	export interface GuildMemberStore {
		randomWhoBlocksMeNot(contextChannel: TextChannel): Promise<GuildMember | undefined>;
	}
}

/**
 * Returns a random number between 0 (inclusive) and max (inclusive)
 * @param max The max value (inclusive)
 */
const randIntFromZeroTo = (max: number): number =>
	Math.floor(Math.random() * (max + 1));

function shuffleArray(array: any[]): void {
	let n = array.length;
	while (n > 1) {
		n--;
		let k = randIntFromZeroTo(n);
		let element = array[k];
		array[k] = array[n];
		array[n] = element;
	}
}

export default class extends Extendable {

	constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [GuildMemberStore] });
	}

	/**
	 * @param contextChannel The first channel to use in the blocksMe check
	 */
	async randomWhoBlocksMeNot(this: GuildMemberStore, contextChannel: TextChannel): Promise<GuildMember | undefined> {
		const members = this.array();
		const indices = members.map((_, i) => i);
		shuffleArray(indices);

		const context = { guild: contextChannel.guild, channel: contextChannel };
		for (const index of indices) {
			const member = members[index];
			if (!member.blocksMe(context)) return member;
		}

		return undefined;
	}

}
