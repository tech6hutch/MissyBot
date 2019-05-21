import { MessageEmbed, TextChannel, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../lib/MissyClient';
import MissyCommand from '../../lib/structures/base/MissyCommand';
import { GuildMessage } from '../../lib/util/types';

export default class extends MissyCommand {

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			usage: '<id:message|url:regex/https:\\/\\/discordapp.com\\/channels\\/(\\d+)\\/(\\d+)\\/(\\d+)/>',
			description: lang => lang.get('COMMAND_QUOTE_DESCRIPTION'),
		});
	}

	async run(cmdMsg: KlasaMessage, [msgOrURL]: [KlasaMessage | RegExpExecArray]) {
		let quotedMsg: KlasaMessage;

		if (Array.isArray(msgOrURL)) {
			const [, guildID, channelID, msgID] = msgOrURL;
			if (cmdMsg.guild && guildID !== cmdMsg.guild.id) throw 'Bad link';

			const channel = (cmdMsg.guild || this.client).channels.get(channelID);
			if (!channel || channel.type !== 'text') throw 'Bad link';

			const msg = await (channel as TextChannel).messages.fetch(msgID);
			if (!msg) throw 'Bad link';

			quotedMsg = msg as KlasaMessage;
		} else {
			quotedMsg = msgOrURL;
		}

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

}
