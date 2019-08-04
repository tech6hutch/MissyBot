import { Snowflake, TextChannel, DMChannel, User, Message } from 'discord.js';
import { KlasaMessage } from 'klasa';
import MissyEvent from '../lib/structures/base/MissyEvent';
import CmdHandler from '../monitors/commandHandler';
import IgnoreNotYou from '../inhibitors/ignoreNotYou';
import { USER_IDS } from '../lib/util/constants';

const cmdWatchingSymbol = Symbol();

type ChannelWithCmdWatchingMap = (TextChannel | DMChannel) & {
	[cmdWatchingSymbol]?: Map<User, number>
};

export default class CmdlessMsgEvent extends MissyEvent {

	memePingers: Snowflake[] = [
		USER_IDS.HUTCH,
		'168161111210852352', // Kru
	];

	get cmdHandler(): CmdHandler {
		return this.client.monitors.get('commandHandler') as CmdHandler;
	}

	async run(msg: KlasaMessage, prefix: RegExp) {
		if (await (this.client.inhibitors.get('ignoreNotYou') as IgnoreNotYou).run(msg)) return undefined;

		if (prefix) {
			const cmdWatchingMap = CmdlessMsgEvent.acquireCmdWatchingMapFor(msg);
			const user = msg.author!;

			// Increment for user
			cmdWatchingMap.set(user, (cmdWatchingMap.get(user) || 0) + 1);

			// Wait for the next message; it's handled by the command handler
			await msg.awaitMsg(msg.language.get('EVENT_COMMANDLESS_MESSAGE_LISTEN'), 30000);

			// Decrement for user
			cmdWatchingMap.set(user, cmdWatchingMap.get(user)! - 1);
			// Remove if zero (or otherwise falsy)
			if (!cmdWatchingMap.get(user)) cmdWatchingMap.delete(user);

			return undefined;
		}

		if (msg.mentions.has(this.client.user!)) {
			return msg.sendLocale(this.memePingers.includes(msg.author!.id) ?
				'EVENT_COMMANDLESS_MESSAGE_MENTION_MEMERS' :
				'EVENT_COMMANDLESS_MESSAGE_MENTION');
		}

		return undefined;
	}

	static acquireCmdWatchingMapFor({ channel }: { channel: TextChannel | DMChannel }): Map<User, number> {
		const cmdWatchingMap = (channel as ChannelWithCmdWatchingMap)[cmdWatchingSymbol] || new Map<User, number>();
		(channel as ChannelWithCmdWatchingMap)[cmdWatchingSymbol] = cmdWatchingMap;
		return cmdWatchingMap;
	}

	static getCmdWatchingMapFor({ channel }: { channel: TextChannel | DMChannel }): Map<User, number> | undefined {
		return (channel as ChannelWithCmdWatchingMap)[cmdWatchingSymbol];
	}

	static shouldObeyPrefixLessCommand(msg: Message): boolean {
		const maybeCmdWatchingMap = CmdlessMsgEvent.getCmdWatchingMapFor(msg);
		return !!maybeCmdWatchingMap &&
			// Only if there's one and only one collector
			maybeCmdWatchingMap.get(msg.author!) === 1;
	}

}
