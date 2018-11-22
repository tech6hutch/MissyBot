import { KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import MissyCommand from '../../lib/structures/MissyCommand';

export default class extends MissyCommand {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: '<:discord:503738729463021568>😮',
			usage: '<name:str> [...]',
			usageDelim: ' ',
			aliases: ['emote'],
		});
	}

	async run(msg: KlasaMessage, names: string[]) {
		const emojis = this.client.emojis.array().filter(e => names.includes(e.name));
		return msg.send(emojis.length ?
			('image' in msg.flags ? emojis.map(e => e.url) : emojis).join(' ') :
			'❓');
	}

}
