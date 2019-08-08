import { Snowflake } from 'discord.js';
import { KlasaUser, KlasaMessage } from 'klasa';
import MissyEvent from '../lib/structures/base/MissyEvent';
import CmdHandler from '../monitors/commandHandler';
import IgnoreNotYou from '../inhibitors/ignoreNotYou';
import { sleep } from '../lib/util/util';
import { USER_IDS } from '../lib/util/constants';

const thirtySeconds = 30_000;

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
			const user = msg.author as KlasaUser;

			msg.sendLocale('EVENT_COMMANDLESS_MESSAGE_LISTEN');
			msg.channel.watchUser(user);

			sleep(thirtySeconds).then(() => {
				const info = msg.channel.getUserWatchingInfo(user);
				if (info) {
					const duration = Date.now() - info.listeningSince;
					if (duration >= thirtySeconds) {
						msg.channel.stopWatchingUser(user);
					}
				}
			});

			return undefined;
		}

		if (msg.mentions.has(this.client.user!)) {
			return msg.sendLocale(this.memePingers.includes(msg.author!.id) ?
				'EVENT_COMMANDLESS_MESSAGE_MENTION_MEMERS' :
				'EVENT_COMMANDLESS_MESSAGE_MENTION');
		}

		return undefined;
	}

}
