import assert from 'assert';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import { arrayRandom } from '../../lib/util/util';
import { IndexedObj, Sendable } from '../../lib/util/types';

type Subcommand = (message: Sendable) => Promise<KlasaMessage | KlasaMessage[]>;
type SubcommandIndexed = IndexedObj<Subcommand>;

const potatoTypes = ['emoji', 'image'];

export default class extends MissyCommand {

	potatoTypes = potatoTypes;
	potatoEmojis = ['🥔', '🍠'];

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			usage: `<${potatoTypes.join('|')}|random:default>`,
			description: lang => lang.get('COMMAND_POTATO_DESCRIPTION'),
			subcommands: true,
		});

		assert(potatoTypes.every(method => typeof (<SubcommandIndexed><any>this)[method] === 'function'));
	}

	random(msg: Sendable) {
		return (<SubcommandIndexed><any>this)[arrayRandom(this.potatoTypes)](msg);
	}

	emoji(msg: Sendable) {
		return msg.send(arrayRandom(this.potatoEmojis));
	}

	image(msg: Sendable) {
		return msg.sendLoading(() => this.client.assets.get('potato-cat').uploadTo(msg));
	}

	async init() {
		for (const emoji of this.client.emojis.values()) {
			if (emoji.name.toLowerCase().includes('potato')) this.potatoEmojis.push(emoji.toString());
		}
	}

}
