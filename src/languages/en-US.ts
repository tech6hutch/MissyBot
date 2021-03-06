import { util, constants as klasaConstants, KlasaMessage } from 'klasa';
import MissyLanguage, { Value } from '../lib/structures/base/MissyLanguage';
import { smartJoin } from '../lib/util/util';
import { IndexedObj } from '../lib/util/types';
import CommandNoU from '../commands/Fun/Image/no-u';
import assert = require('assert');

const { TIME } = klasaConstants;

export default class extends MissyLanguage {

	DISCORD_EMOJI = '<:discord:503738729463021568>';

	language: IndexedObj<Value> = {
		PREFIX_REMINDER: ({ prefix, disableNaturalPrefix }) => {
			const prefixes = [];
			if (!disableNaturalPrefix) prefixes.push(this.client.PREFIX_PLAIN);
			if (prefix) prefixes.push(prefix);
			if (!prefixes.length) prefixes.push(`@${this.client.user!.tag}`);

			return `The prefix${prefixes.length > 1 ?
				`es for this server are ` :
				` in this server is set to `
			}${smartJoin(prefixes.map(pre => `\`${pre}\``))}.`;
		},

		// Resolver and prompts

		RESOLVER_MULTI_TOO_FEW: (name, min = 1) => `Provided too few ${name}s. Atleast ${min} ${min === 1 ? 'is' : 'are'} required.`,
		RESOLVER_INVALID_BOOL: (name) => `${name} must be true or false.`,
		RESOLVER_INVALID_CHANNEL: (name) => `${name} must be a channel tag or valid channel id.`,
		RESOLVER_INVALID_CUSTOM: (name, type) => `${name} must be a valid ${type}.`,
		RESOLVER_INVALID_DATE: (name) => `${name} must be a valid date.`,
		RESOLVER_INVALID_DURATION: (name) => `${name} must be a valid duration string.`,
		RESOLVER_INVALID_EMOJI: (name) => `${name} must be a custom emoji tag or valid emoji id.`,
		RESOLVER_INVALID_FLOAT: (name) => `${name} must be a valid number.`,
		RESOLVER_INVALID_GUILD: (name) => `${name} must be a valid server id.`,
		RESOLVER_INVALID_INT: (name) => `${name} must be an integer.`,
		RESOLVER_INVALID_LITERAL: (name) => `Your option did not match the only possibility: ${name}`,
		RESOLVER_INVALID_MEMBER: (name) => `${name} must be a mention or valid user id.`,
		RESOLVER_INVALID_MESSAGE: (name) => `${name} must be a valid message id.`,
		RESOLVER_INVALID_PIECE: (name, piece) => `${name} must be a valid ${piece} name.`,
		RESOLVER_INVALID_REGEX_MATCH: (name, pattern) => `${name} must follow this regex pattern \`${pattern}\`.`,
		RESOLVER_INVALID_ROLE: (name) => `${name} must be a role mention or role id.`,
		RESOLVER_INVALID_STRING: (name) => `${name} must be a valid string.`,
		RESOLVER_INVALID_TIME: (name) => `${name} must be a valid duration or date string.`,
		RESOLVER_INVALID_URL: (name) => `${name} must be a valid url.`,
		RESOLVER_INVALID_USER: (name) => `${name} must be a mention or valid user id.`,
		RESOLVER_STRING_SUFFIX: ' characters',
		RESOLVER_MINMAX_EXACTLY: (name, min, suffix) => `${name} must be exactly ${min}${suffix}.`,
		RESOLVER_MINMAX_BOTH: (name, min, max, suffix) => `${name} must be between ${min} and ${max}${suffix}.`,
		RESOLVER_MINMAX_MIN: (name, min, suffix) => `${name} must be greater than ${min}${suffix}.`,
		RESOLVER_MINMAX_MAX: (name, max, suffix) => `${name} must be less than ${max}${suffix}.`,

		REACTIONHANDLER_PROMPT: 'Which page would you like to jump to?',
		// I added these two:
		REACTIONHANDLER_SPAM_WARN: "Please slow down, I can't keep up @_@",
		REACTIONHANDLER_SPAM_STOP: 'Stop >_<',
		COMMANDMESSAGE_MISSING: 'Missing one or more required arguments after end of input.',
		COMMANDMESSAGE_MISSING_REQUIRED: (name) => `You're missing the "${name}" parameter.`,
		COMMANDMESSAGE_MISSING_OPTIONALS: (possibles) => `Missing a required option: (${possibles})`,
		COMMANDMESSAGE_NOMATCH: (possibles) => `Your option didn't match any of the possibilities: (${possibles})`,

		MESSAGE_PROMPT_TIMEOUT: 'The prompt has timed out.',

		// Pieces

		// Custom events
		EVENT_COMMANDLESS_MESSAGE_LISTEN: 'Yes? 👂',
		EVENT_COMMANDLESS_MESSAGE_MENTION: this.rr({
			everyone: [
				'Did someone mention me?',
				'You called?',
				'Yay! Mentions!',
			],
		}),
		EVENT_COMMANDLESS_MESSAGE_MENTION_MEMERS: 'Was it Hutch or Kru this time? XD',
		EVENT_COMMAND_UNKNOWN_UNKNOWN: this.rr({
			everyone: [
				"I don't know what that means, sorry @_@",
				"I'm so confused @_@",
				"I'm too dumb, sorry XD",
				"I'm a potato!",
				"I didn't get that @_@",
			],
		}),
		EVENT_COMMAND_UNKNOWN_MARBLES: "They're nice, and all, but I seem to have lost all of mine @_@",

		// Monitors
		MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error, time, abortOptions: string[]) => `${tag} | **${error}** | Or type **${abortOptions.map(abort => abort.toUpperCase()).join('**, **')}** to cancel. (Auto-cancels after **${time}** seconds.)`,
		MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: (tag, name, time) => `${tag} | **${name}** can be repeated | Or type **CANCEL** to cancel. (Auto-cancels after **${time}** seconds.)`,
		MONITOR_COMMAND_HANDLER_ABORTED: 'Canceled 👌🏽',
		MONITOR_COMMAND_HANDLER_POSSIBILITIES: ['cancel'],

		// Inhibitors
		INHIBITOR_COOLDOWN: (remaining) => `You have just used this command. You can use this command again in ${remaining} second${remaining === 1 ? '' : 's'}.`,
		INHIBITOR_DISABLED: 'This command is currently disabled.',
		INHIBITOR_MISSING_BOT_PERMS: (missing) => `Insufficient permissions, missing: **${missing}**`,
		INHIBITOR_NSFW: 'You may not use NSFW commands in this channel.',
		INHIBITOR_PERMISSIONS: "Sorryyy, but I can't let you do that 😅",
		INHIBITOR_REQUIRED_SETTINGS: (settings) => `The server is missing the **${settings.join(', ')}** server setting${settings.length !== 1 ? 's' : ''} and thus the command cannot run.`,
		INHIBITOR_RUNIN: (types) => `This command is only available in ${types} channels.`,
		INHIBITOR_RUNIN_NONE: (name) => `The ${name} command is not configured to run in any channel.`,

		// Custom finalizers
		FINALIZER_NOTYOU: this.rr({
			everyone: [
				'Oh, sorry! Ping me when you want me.',
				"Alright, I'll go play somewhere else until @'d",
				'Understood 👍 To get my attention, @mention me',
			],
		}),
		FINALIZER_DELETE_FLAG_NO_DELETE: "❌ | I couldn't delete your message, sorry :/",

		// Core commands
		COMMAND_BLACKLIST_DESCRIPTION: 'Blacklists or un-blacklists users and servers from the bot.',
		COMMAND_BLACKLIST_SUCCESS: (usersAdded, usersRemoved, guildsAdded, guildsRemoved) => [
			usersAdded.length ? `**Users Added**\n${util.codeBlock('', usersAdded.join(', '))}` : '',
			usersRemoved.length ? `**Users Removed**\n${util.codeBlock('', usersRemoved.join(', '))}` : '',
			guildsAdded.length ? `**Servers Added**\n${util.codeBlock('', guildsAdded.join(', '))}` : '',
			guildsRemoved.length ? `**Servers Removed**\n${util.codeBlock('', guildsRemoved.join(', '))}` : ''
		].filter(val => val !== '').join('\n'),
		COMMAND_EVAL_DESCRIPTION: 'Evaluates arbitrary Javascript. Reserved for bot owner.',
		COMMAND_EVAL_EXTENDEDHELP: [
			'The eval command evaluates code as-in, any error thrown from it will be handled.',
			'It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.',
			'The --silent flag will make it output nothing.',
			"The --depth flag accepts a number, for example, --depth=2, to customize util.inspect's depth.",
			'The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword.',
			'The --showHidden flag will enable the showHidden option in util.inspect.',
			'If the output is too large, it\'ll send the output as a file, or in the console if the bot does not have the ATTACH_FILES permission.'
		].join('\n'),
		COMMAND_EVAL_ERROR: (time, output, type) => `**Error**:${output}\n**Type**:${type}\n${time}`,
		COMMAND_EVAL_OUTPUT: (time, output, type) => `**Output**:${output}\n**Type**:${type}\n${time}`,
		COMMAND_EVAL_SENDFILE: (time, type) => `Output was too long... sent the result as a file.\n**Type**:${type}\n${time}`,
		COMMAND_EVAL_SENDCONSOLE: (time, type) => `Output was too long... sent the result to console.\n**Type**:${type}\n${time}`,
		COMMAND_UNLOAD: (type, name) => `✅ Unloaded ${type}: ${name}`,
		COMMAND_UNLOAD_DESCRIPTION: 'Unloads the klasa piece.',
		COMMAND_UNLOAD_WARN: 'You probably don\'t want to unload that, since you wouldn\'t be able to run any command to enable it again',
		COMMAND_TRANSFER_ERROR: '❌ That file has been transfered already or never existed.',
		COMMAND_TRANSFER_SUCCESS: (type, name) => `✅ Successfully transferred ${type}: ${name}.`,
		COMMAND_TRANSFER_FAILED: (type, name) => `Transfer of ${type}: ${name} to Client has failed. Please check your Console.`,
		COMMAND_TRANSFER_DESCRIPTION: 'Transfers a core piece to its respective folder.',
		COMMAND_RELOAD: (type, name, time) => `✅ Reloaded ${type}: ${name}. (Took: ${time})`,
		COMMAND_RELOAD_FAILED: (type, name) => `❌ Failed to reload ${type}: ${name}. Please check your Console.`,
		COMMAND_RELOAD_ALL: (type, time) => `✅ Reloaded all ${type}. (Took: ${time})`,
		COMMAND_RELOAD_EVERYTHING: (time) => `✅ Reloaded everything. (Took: ${time})`,
		COMMAND_RELOAD_DESCRIPTION: 'Reloads a klasa piece, or all pieces of a klasa store.',
		COMMAND_REBOOT: 'Buyy buyy...',
		COMMAND_REBOOT_DESCRIPTION: 'Reboots the bot.',
		COMMAND_REBOOT_SUCCESS: time => `Ah, that was a nice nap. I ${time ? `slept for ⏱ ${time}.` : "don't know how long I slept, though."}`,
		COMMAND_LOAD: (time, type, name) => `✅ Successfully loaded ${type}: ${name}. (Took: ${time})`,
		COMMAND_LOAD_FAIL: 'The file does not exist, or an error occurred while loading your file. Please check your console.',
		COMMAND_LOAD_ERROR: (type, name, error) => `❌ Failed to load ${type}: ${name}. Reason:${util.codeBlock('js', error)}`,
		COMMAND_LOAD_DESCRIPTION: 'Load a piece from your bot.',
		COMMAND_PING: (ping, embed) => embed
			.addField(`${this.DISCORD_EMOJI} Ping:`, 'Pinging Discord...')
			.addField('💓 Heartbeat:', `${Math.round(TIME.MINUTE / ping)} bpm (1 every ${Math.round(ping)} ms)`)
			.setFooter("Bots have faster heartbeats than humans, so don't worry if mine is really high!"),
		COMMAND_PING_DESCRIPTION: 'Check my connection to Discord.',
		COMMAND_PINGPONG: (diff, embed) => {
			embed.fields[0].value = `${diff} ms`;
			return embed;
		},
		COMMAND_INVITE: () => [
			`To add ${this.client.user!.username} to your Discord server:`,
			this.client.invite,
			util.codeBlock('', [
				'The above link is generated requesting the minimum permissions required to use every command currently.',
				'I know not all permissions are right for every server, so don\'t be afraid to uncheck any of the boxes.',
				'If you try to use a command that requires more permissions than the bot is granted, it will let you know.'
			].join(' ')),
			'Please file an issue at <https://github.com/tech6hutch/MissyBot> if you find any bugs.'
		],
		COMMAND_INVITE_DESCRIPTION: 'Displays the invite link of the bot, to invite it to your server.',
		COMMAND_INFO: () => [
			"Hi! I'm MissyBot!",
			'',
			// eslint-disable-next-line max-len
			`As my name might imply, I'm a Discord bot. I'm based off of the real Missy, \`${this.client.missy.tag}\`. My creator is \`${this.client.hutch.tag}\`, he's great! I have a variety of fun commands and responses.`,
			'',
			'For a list of my commands: `Missy, help`',
			'For help on a specific command: `Missy, help commandName`',
		],
		COMMAND_INFO_DESCRIPTION: 'Provides some information about me. 🙂',
		COMMAND_HELP_DESCRIPTION: 'Display help for a command.',
		COMMAND_HELP_NO_EXTENDED: 'No extended help available.',
		COMMAND_HELP_DM: '📥 | No problem! I sent you help about my commands.',
		COMMAND_HELP_NODM: '❌ | I couldn\'t DM you :/ If you enable DMs from me, I can send you command help.',
		COMMAND_HELP_OTHER_DM: '📥 | I sent them help about my commands.',
		COMMAND_HELP_OTHER_NODM: '❌ | I couldn\'t DM them :/',
		COMMAND_HELP_PREFIX_NOTE: ({ prefix, disableNaturalPrefix }) => disableNaturalPrefix ? [
			'The default prefix is `Missy` (with or without a comma).',
			prefix ?
				`In that server, however, you may only use \`${prefix}\`.` :
				'In that server, however, I will only respond to @mentions.',
			'\u200b',
		] : [
			'The prefix is "Missy" (with or without a comma).',
			...prefix ? [`In that server, however, you may also use \`${prefix}\`.`] : [],
			'\u200b',
		],
		COMMAND_HELP_USAGE: (usage) => `Usage :: ${usage}`,
		COMMAND_HELP_EXTENDED: 'Extended Help ::',
		COMMAND_ENABLE: (type, name) => `+ Successfully enabled ${type}: ${name}`,
		COMMAND_ENABLE_DESCRIPTION: 'Re-enables or temporarily enables a command/inhibitor/monitor/finalizer. Default state restored on reboot.',
		COMMAND_DISABLE: (type, name) => `+ Successfully disabled ${type}: ${name}`,
		COMMAND_DISABLE_DESCRIPTION: 'Re-disables or temporarily disables a command/inhibitor/monitor/finalizer/event. Default state restored on reboot.',
		COMMAND_DISABLE_WARN: 'You probably don\'t want to disable that, since you wouldn\'t be able to run any command to enable it again',
		COMMAND_CONF_NOKEY: 'You must provide a key',
		COMMAND_CONF_NOVALUE: 'You must provide a value',
		COMMAND_CONF_GUARDED: (name) => `${util.toTitleCase(name)} may not be disabled.`,
		COMMAND_CONF_UPDATED: (key, response) => `Successfully updated the key **${key}**: \`${response}\``,
		COMMAND_CONF_KEY_NOT_ARRAY: 'This key is not array type. Use the action \'reset\' instead.',
		COMMAND_CONF_GET_NOEXT: (key) => `The key **${key}** does not seem to exist.`,
		COMMAND_CONF_GET: (key, value) => `The value for the key **${key}** is: \`${value}\``,
		COMMAND_CONF_RESET: (key, response) => `The key **${key}** has been reset to: \`${response}\``,
		COMMAND_CONF_NOCHANGE: (key) => `The value for **${key}** was already that value.`,
		COMMAND_CONF_SERVER_DESCRIPTION: 'Define per-server settings.',
		COMMAND_CONF_SERVER: (key, list) => `**Server Settings${key}**\n${list}`,
		COMMAND_CONF_USER_DESCRIPTION: 'Define per-user settings.',
		COMMAND_CONF_USER: (key, list) => `**User Settings${key}**\n${list}`,
		COMMAND_STATS: (memUsage, uptime, users, guilds, channels, klasaVersion, discordVersion, processVersion, message) => [
			'= STATISTICS =',
			'',
			`• Mem Usage  :: ${memUsage} MB`,
			`• Uptime     :: ${uptime}`,
			`• Users      :: ${users}`,
			`• Servers    :: ${guilds}`,
			`• Channels   :: ${channels}`,
			`• Klasa      :: v${klasaVersion}`,
			`• Discord.js :: v${discordVersion}`,
			`• Node.js    :: ${processVersion}`,
			`• Shard      :: ${(message.guild ? message.guild.shardID : 0) + 1} / ${this.client.options.totalShardCount}`,
		],
		COMMAND_STATS_DESCRIPTION: 'Provides some details about the bot and stats.',

		// Custom commands
		COMMAND_EXAMPLE: example => `Example: ${example}`,
		COMMAND_EXAMPLES: (examples: string[]) => [
			'Examples:',
			...examples,
		].join('\n'),
		COMMAND_PREFIX_DESCRIPTION: 'See the prefixes you can use on this server.',
		COMMAND_SLEEP_DESCRIPTION: 'Tell someone to get their butt to bed!',
		COMMAND_SLEEP: this.rr({
			everyone: [
				user => `Go to sleep, ${user}!`,
				user => `${user}, make sure you're getting enough sleep, little one!`,
				(user, { author }: KlasaMessage) => `${user}, ${author} says it's bedtime.`,
				user => `${user}, get your butt to sleep, little one.`,
				user => `Please sleep buttercup ${user}`,
			],
			self: [
				"But I'm a robot, I don't need to sleep ;-;",
				"You can't tell me to sleep!",
				['Nooooooo', "It's not bedtime yet!"],
				(_user, msg: KlasaMessage) => {
					(this.client.commands.get('no-u') as CommandNoU).noU(msg);
					return 'no u';
				},
			],
		}),
		COMMAND_LEWD_DESCRIPTION: 'Nice try. 😝',
		COMMAND_LEWD_LOADING_TEXT: '<.<\n>.>',
		COMMAND_LEWD_NSFW_HINT: '(Psst, try this command in a NSFW channel for a surprise! 🤐)',
		COMMAND_EAT_DESCRIPTION: 'Tell someone to eat.',
		COMMAND_EAT: this.rr({
			everyone: [
				(user, something: string) => `Eat ${something}, ${user}!`,
				user => `${user}, make sure you're eating enough, little one!`,
				(user, something: string, { author }: KlasaMessage) => `${user}, ${author} says to eat ${something}.`,
				(user, something: string) => `${user}, eat ${something}, little one.`,
			],
			self: [
				"But I'm a robot, I don't need to eat ;-;",
				() => `But I'm already eating. I have ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB of heap memory in my belly.`,
				(_user, _something, msg: KlasaMessage) => {
					(this.client.commands.get('no-u') as CommandNoU).noU(msg);
					return 'no u';
				},
			],
		}),
		COMMAND_FAKEBAN: this.rr({
			everyone: [
				'Please give them another chance ;-;',
				"Won't you give them another chance? For me?",
				'Awww, are you going to ban them?',
			],
		}),
		COMMAND_FAKEKICK: this.rr({
			everyone: [
				'Aw, do we have to?',
				'Have you tried asking them nicely?',
				"I bet they'll behave from now on. Right?",
			],
		}),
		COMMAND_BIRTHDAY_DESCRIPTION: 'Wish someone (or multiple people) a happy birthday 🎂',
		COMMAND_BIRTHDAY: 'Happy birthday!',
		COMMAND_BIRTHDAY_MENTIONS: users => `Happy birthday, ${smartJoin(users)}!`,
		COMMAND_HUG_DESCRIPTION: 'Need a hug? 🙂',
		COMMAND_PAT_DESCRIPTION: 'There, there. ✋🏽',
		COMMAND_TYPE_DESCRIPTION: "😮 Who's that typing?",
		COMMAND_MYSWEARS_EXTENDEDHELP: [
			'I see you swearing 👀',
			'',
			"Don't worry, tho, I like swearing. I just have too much self control to do it myself 😛",
			'Only tracks swears in English.',
		].join('\n'),
		COMMAND_MYSWEARS_NO_UNCENSORED: 'You can only view the uncensored version in a NSFW channel!',
		COMMAND_MYSWEARS_MOD_UNCENSORED: "The uncensored version is normally restricted to NSFW channels, but since you're a mod I'll assume you know what you're doing.",
		COMMAND_SEND_DESCRIPTION: 'Ask me to send something.',
		COMMAND_SEND_EXTENDEDHELP: "If you don't mention anyone, I'll just send it here, or to you.",
		COMMAND_SEND_MISSING_WHAT: "You didn't tell me what to send!",
		COMMAND_SEND_POTATO: 'Sent them a potato 👌',
		COMMAND_SEND_MARBLES: 'I seem to have lost all of mine @_@',
		COMMAND_SEND_UNKNOWN: "I don't know how to send that >_<",
		COMMAND_NOU_LOADING_TEXT: 'Rebutting your argument...',
		COMMAND_POTATO_DESCRIPTION: 'Post a random potato!',
		COMMAND_MEME_DESCRIPTION: "It seems I've made a meme!",
		COMMAND_COOKIE_DESCRIPTION: 'I have a lot of cookies. 😋 Want one?',
		COMMAND_DOG_DESCRIPTION: 'Show a random dog image!',
		COMMAND_CAT_DESCRIPTION: 'Show a random cat image!',
		COMMAND_SHIP_DESCRIPTION: 'Tag two people to ship them!',
		COMMAND_SHIP: (msg, person1, person2, asStr, embed) => embed
			.setTitle(`${person1.displayName} + ${person2.displayName}${asStr ? ` (${asStr})` : ''}`)
			.setDescription(`I think ${person1} and ${person2} would be wonderful together! :D`)
			.setAuthor(msg.guild ? msg.guild.me.displayName : this.client.user!.username, this.client.user!.displayAvatarURL())
			.setThumbnail('https://raw.githubusercontent.com/twitter/twemoji/gh-pages/72x72/1f49e.png')
			.addField('Ship Level', '💟'.repeat(10), true)
			.addField('Ship Compatibility', '100%! ♥', true)
			.addField('Similar Interests', [
				'• Both are human',
				'• Both survive by consuming plant or animal matter',
				'• Both use Discord',
			].join('\n'), true)
			.addField('Positive Qualities', [
				'• Suitable mating partner',
				'• Body heat can defrost cold objects',
				"• You're both cuties!",
			].join('\n'), true)
			.setFooter('Go! '.repeat(4)),
		COMMAND_NOCONTEXT_DESCRIPTION: 'Get a no-context quote from Missy.',
		COMMAND_INTERACTION_EXTENDEDHELP: "If you don't mention anyone, I'll assume you mean the person above you.",
		COMMAND_ATTACK_DESCRIPTION: "I'll go on the attack!",
		COMMAND_ATTACK: this.rr({
			everyone: [ user => `${user} <a:attack:530938382763819030>` ],
		}),
		COMMAND_SLAP_DESCRIPTION: 'If you really want me to, I can slap someone. ✋🏽',
		COMMAND_SLAP: this.rr({
			everyone: [
				user => `If I must...\n\n_\\*Slaps ${user} on the cheek!\\* ...except it's more of a firm pat._`,
			],
			everyoneRare: [
				user => `_\\*Slaps ${user} hard across the face\\*_ ...Oh! I'm sorry! I hit too hard ;-;`,
			],
		}),
		COMMAND_PUNCH_DESCRIPTION: 'Falcon, PAWWWWNCH! 👊🏽',
		COMMAND_PUNCH: this.rr({
			everyone: [user => `_\\*Lightly punches ${user}'s arm\\*_`],
		}),
		COMMAND_SPANK_DESCRIPTION: 'Has someone been naughty? Pleasedontmakemedothis',
		COMMAND_SPANK: this.rr({
			everyone: [
				user => `_\\*Does not spank ${user}\\*_`,
				user => `_\\*Swats in the direction of ${user}'s butt, but doesn't make contact\\*_`,
				user => `_\\*Pats ${user}'s back\\*_`,
				user => `_\\*Lightly smacks the side of ${user}'s butt with her fingertips\\*_`,
				user => `_\\*Lets ${user} off with a warning\\*_`,
			],
			everyoneRare: [
				// eslint-disable-next-line max-len
				user => `_\\*Forces ${user} over her lap\\*_ Take that! _\\*Spanks\\*_ And that! _\\*Spanks\\*_...\n\nNow be good, or I'll pull your pants down next time! ...What? Why are you looking at me like that?`,
			],
		}),
		COMMAND_QUOTE_DESCRIPTION: 'Quote a message. (Turn on developer mode in Discord in order to copy IDs and links.)',
		COMMAND_QUOTE_EXTENDEDHELP: '',

		// Custom misc.
		LOADING_TEXT: 'Just a moment.',
		SENT_IMAGE: 'Sent the image 👌',
	};

	// static readonly vowels: readonly string[] = ['a', 'e', 'i', 'o', 'u'];

	// /**
	//  * Get the plural form of a (lowercase) word.
	//  *
	//  * It follows simple rules, returning undefined in lieu of consulting a
	//  * dictionary. Also, it will return incorrect results for words with an
	//  * irregular plural form, like child -> ~~children~~ childs.
	//  */
	// static pluralize(word: string): string | undefined {
	// 	if (!word) return '';
	// 	if (word !== word.toLowerCase()) {
	// 		console.warn(`Non-lowercase word '${word.replace("'", "\\'")}' passed to en-US pluralize()`);
	// 		return undefined;
	// 	}

	// 	const lastLetter = word[word.length - 1];
	// 	const nextToLast = word.length >= 2 ? word[word.length - 2] : '';
	// 	const lastTwoLetters = lastLetter + nextToLast;
	// 	assert(lastLetter.length === 1 && nextToLast.length === 1);
	// 	assert(lastTwoLetters.length === 2);

	// 	if (lastLetter === 'y')
	// 		return this.vowels.includes(nextToLast) ?
	// 			`${word}s` :
	// 			`${word.slice(0, -1)}ies`;

	// 	if (lastLetter === 'o')
	// 		return this.vowels.includes(nextToLast) ?
	// 			`${word}s` :
	// 			undefined;

	// 	if (lastLetter === 'f' || lastTwoLetters === 'fe')
	// 		return lastTwoLetters === 'ff' ?
	// 			`${word}s` :
	// 			undefined;

	// 	if (['s', 'x', 'sh', 'ch'].some(s => word.endsWith(s)))
	// 		return `${word}es`;

	// 	return undefined;
	// }

}
