import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import HelpCmd from './Chat Bot Info/help';
import LewdCmd from '../Fun/Image/lewd';
import PotatoCmd from '../Fun/potato';
import { Sendable } from '../../lib/util/types';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: lang => lang.get('COMMAND_SEND_DESCRIPTION'),
			usage: '<what:str> [to] [whom:mention]',
			usageDelim: ' ',
			extendedHelp: lang => lang.get('COMMAND_SEND_EXTENDEDHELP'),
		});

		this.customizeResponse('what', ({ language }) => language.get('COMMAND_SEND_MISSING_WHAT'));
	}

	async run(msg: KlasaMessage, [what, , whom = msg]: [string, string | undefined, Sendable]) {
		const local = msg === whom;

		switch (what) {
			case 'help': {
				const helpCmd = <HelpCmd><MissyCommand>this.store.get('help');
				return local ?
					helpCmd.sendHelp(msg) :
					helpCmd.sendHelp(msg, undefined, whom, {
						doneText: msg.language.get('COMMAND_HELP_OTHER_DM'),
						failText: msg.language.get('COMMAND_HELP_OTHER_NODM'),
					});
			}

			case 'nudes':
			case 'noods': {
				const lewdCmd = <LewdCmd><any>this.store.get('lewd');
				return local ?
					lewdCmd.postSfwImage(msg) :
					lewdCmd.postSfwImageSomewhere(msg, whom).then(array => array[0]);
			}

			case 'potato': {
				const potatoP: Promise<KlasaMessage | KlasaMessage[]> = (<PotatoCmd><MissyCommand>this.store.get('potato')).random(whom);
				return local ? potatoP : msg.sendLocale('COMMAND_SEND_POTATO');
			}

			case 'marbles': return msg.sendLocale('COMMAND_SEND_MARBLES');

			default: return msg.sendLocale('COMMAND_SEND_UNKNOWN');
		}
	}

}
