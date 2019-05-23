import assert from 'assert';
import { MessageEmbed, TextChannel, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import { GuildMessage } from '../../lib/util/types';

type MsgResolvable = KlasaMessage | RegExpExecArray | string;

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			usage: '[channel:channel] <id:message|url:regex/https:\\/\\/discordapp.com\\/channels\\/(\\d+)\\/(\\d+)\\/(\\d+)/|id:str>',
			usageDelim: ' ',
			helpUsage: '[channel:channel] <id:message|url:link>',
			description: lang => lang.get('COMMAND_QUOTE_DESCRIPTION'),
			extendedHelp: lang => lang.get('COMMAND_EXAMPLES', [
				'Missy, quote 123456789012345678',
				'Missy, quote #general 123456789012345678',
				'Missy, quote https://discordapp.com/channels/123456789012345678/901234567890123456/789012345678901234',
			]),
		});
	}

	async run(cmdMsg: KlasaMessage, [maybeChannel, msgOrURLOrID]: [TextChannel | undefined, MsgResolvable]) {
		const quotedMsg: KlasaMessage = await this.resolveMsgOrThrow(msgOrURLOrID, maybeChannel, cmdMsg);

		const { author, member, attachments, reactions } = quotedMsg as GuildMessage;
		const name = member ? member.displayName : author.username;

		const embed = new MessageEmbed()
			.setAuthor(name, author.displayAvatarURL())
			.setColor(member.displayColor)
			.setDescription(quotedMsg.content)
			.addField(`_ _`, `[🔗](${quotedMsg.url})`)
			.setTimestamp(quotedMsg.createdAt);

		if (reactions.size) {
			embed.setFooter(reactions.map(reaction => reaction.emoji.toString()).join(' '));
		}

		const imgID: string | undefined = attachments.findKey(att => typeof att.width === 'number');
		let otherAttachments = attachments;
		if (imgID) {
			embed.setImage(attachments.get(imgID)!.url);
			otherAttachments = attachments.filter((_, id) => id !== imgID);
		}
		if (otherAttachments.size) {
			embed.addField('📎', otherAttachments.map(att => att.url).join('\n'));
		}

		return cmdMsg.sendEmbed(embed);
	}

	private async resolveMsgOrThrow(input: MsgResolvable, maybeChannel: TextChannel | undefined, contextMsg: KlasaMessage) {
		if (Array.isArray(input)) {
			const [, guildID, channelID, msgID] = input;
			if (contextMsg.guild && guildID !== contextMsg.guild.id) throw 'Bad link';

			const channel = (contextMsg.guild || this.client).channels.get(channelID);
			if (!channel || channel.type !== 'text') throw 'Bad link';

			const msg = await (channel as TextChannel).messages.fetch(msgID);
			if (!msg) throw 'Bad link';

			return msg as KlasaMessage;
		} else if (input instanceof KlasaMessage) {
			return input;
		} else {
			if (!maybeChannel) throw "What channel??";

			const msgID = input;
			const msg = await maybeChannel.messages.fetch(msgID);
			if (!msg) throw 'Bad message ID';

			return msg as KlasaMessage;
		}
	}

}
