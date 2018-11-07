const { Language, util, constants: { TIME: { MINUTE } } } = require('klasa');
const { ensureArray, smartJoin } = require('../lib/util/util');

const DISCORD_EMOJI = '<:discord:503738729463021568>';

module.exports = class extends Language {

	constructor(...args) {
		super(...args);
		this.language = {
			DEFAULT: (key) => `${key} has not been localized for en-US yet.`,
			DEFAULT_LANGUAGE: 'Default Language',

			/**
			 * @param {string|string[]} prefix Guild prefixes or w/e
			 * @returns {string}
			 */
			PREFIX_REMINDER: (prefix = `@${this.client.user.tag}`) => {
				if (Array.isArray(prefix)) {
					let missyIndex = -1;
					let missyCommaIndex = -1;
					prefix = prefix.map((pre, i) => {
						switch (pre) {
							case 'Missy':
								missyIndex = i;
								return pre;
							case 'Missy,':
								missyCommaIndex = i;
								return pre;
							default:
								return `\`${pre}\``;
						}
					});
					if (missyIndex > -1 && missyCommaIndex > -1) {
						prefix[missyIndex] = `\`Missy\` (with or without a comma)`;
						prefix.splice(missyCommaIndex, 1);
					} else if (missyIndex > -1) {
						prefix[missyIndex] = `\`${prefix[missyIndex]}\``;
					} else if (missyCommaIndex > -1) {
						prefix[missyCommaIndex] = `\`${prefix[missyCommaIndex]}\``;
					}
					// We maybe spliced out one of the prefixes.
					// If there's only one, we'll just say there's only one prefix.
					if (prefix.length === 1) [prefix] = prefix;
				} else {
					prefix = `\`${prefix}\``;
				}

				return `The prefix${Array.isArray(prefix) ?
					`es for this server are ${smartJoin(prefix)}` :
					` in this server is set to ${prefix}`
				}.`;
			},

			PLAYING_ACTIVITY: [
				['with myself 🎮'],
				['with potatoes! 🥔'],
				['with myself (why is this so funny? 🤔)'],
				['for your command 💂', { type: 'WATCHING' }],
				["with myself (seriously, guys, what's so funny? @_@)"],
				['EDM 💃🏽', { type: 'LISTENING' }],
				['rock music 🤘', { type: 'LISTENING' }],
			],

			// SettingsGateway, resolver, and prompts

			SETTING_GATEWAY_EXPECTS_GUILD: 'The parameter <Guild> expects either a Guild or a Guild Object.',
			SETTING_GATEWAY_VALUE_FOR_KEY_NOEXT: (data, key) => `The value ${data} for the key ${key} does not exist.`,
			SETTING_GATEWAY_VALUE_FOR_KEY_ALREXT: (data, key) => `The value ${data} for the key ${key} already exists.`,
			SETTING_GATEWAY_SPECIFY_VALUE: 'You must specify the value to add or filter.',
			SETTING_GATEWAY_KEY_NOT_ARRAY: (key) => `The key ${key} is not an Array.`,
			SETTING_GATEWAY_KEY_NOEXT: (key) => `The key ${key} does not exist in the current data schema.`,
			SETTING_GATEWAY_INVALID_TYPE: 'The type parameter must be either add or remove.',
			SETTING_GATEWAY_INVALID_FILTERED_VALUE: (piece, value) => `${piece.key} doesn't accept the value: ${value}`,

			RESOLVER_MULTI_TOO_FEW: (name, min = 1) => `Provided too few ${name}s. Atleast ${min} ${min === 1 ? 'is' : 'are'} required.`,
			RESOLVER_INVALID_BOOL: (name) => `${name} must be true or false.`,
			RESOLVER_INVALID_CHANNEL: (name) => `${name} must be a channel tag or valid channel id.`,
			RESOLVER_INVALID_CUSTOM: (name, type) => `${name} must be a valid ${type}.`,
			RESOLVER_INVALID_DATE: (name) => `${name} must be a valid date.`,
			RESOLVER_INVALID_DURATION: (name) => `${name} must be a valid duration string.`,
			RESOLVER_INVALID_EMOJI: (name) => `${name} must be a custom emoji tag or valid emoji id.`,
			RESOLVER_INVALID_FLOAT: (name) => `${name} must be a valid number.`,
			RESOLVER_INVALID_GUILD: (name) => `${name} must be a valid guild id.`,
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
			// I added this one:
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
			EVENT_COMMANDLESS_MESSAGE_MENTION: [
				'Did someone mention me?',
				'You called?',
				'Yay! Mentions!',
			],
			EVENT_COMMANDLESS_MESSAGE_MENTION_HUTCH_KRU: 'Was it Hutch or Kru this time? XD',
			EVENT_COMMAND_UNKNOWN_UNKNOWN: [
				"I don't know what that means, sorry @_@",
				"I'm so confused @_@",
				"I'm too dumb, sorry XD",
				"I'm a potato!",
			],
			EVENT_COMMAND_UNKNOWN_MARBLES: "They're nice, and all, but I seem to have lost all of mine @_@",

			// Monitors
			MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error, time) => `${tag} | **${error}** | You have **${time}** seconds to respond to this prompt with a valid argument. Type **"ABORT"** to abort this prompt.`, // eslint-disable-line max-len
			MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: (tag, name, time) => `${tag} | **${name}** is a repeating argument | You have **${time}** seconds to respond to this prompt with additional valid arguments. Type **"CANCEL"** to cancel this prompt.`, // eslint-disable-line max-len
			MONITOR_COMMAND_HANDLER_ABORTED: 'Aborted',

			// Inhibitors
			INHIBITOR_COOLDOWN: (remaining) => `You have just used this command. You can use this command again in ${remaining} second${remaining === 1 ? '' : 's'}.`,
			INHIBITOR_DISABLED: 'This command is currently disabled.',
			INHIBITOR_MISSING_BOT_PERMS: (missing) => `Insufficient permissions, missing: **${missing}**`,
			INHIBITOR_NSFW: 'You may not use NSFW commands in this channel.',
			INHIBITOR_PERMISSIONS: 'You do not have permission to use this command.',
			INHIBITOR_REQUIRED_SETTINGS: (settings) => `The guild is missing the **${settings.join(', ')}** guild setting${settings.length !== 1 ? 's' : ''} and thus the command cannot run.`,
			INHIBITOR_RUNIN: (types) => `This command is only available in ${types} channels.`,
			INHIBITOR_RUNIN_NONE: (name) => `The ${name} command is not configured to run in any channel.`,

			// Core commands
			COMMAND_BLACKLIST_DESCRIPTION: 'Blacklists or un-blacklists users and guilds from the bot.',
			COMMAND_BLACKLIST_SUCCESS: (usersAdded, usersRemoved, guildsAdded, guildsRemoved) => [
				usersAdded.length ? `**Users Added**\n${util.codeBlock('', usersAdded.join(', '))}` : '',
				usersRemoved.length ? `**Users Removed**\n${util.codeBlock('', usersRemoved.join(', '))}` : '',
				guildsAdded.length ? `**Guilds Added**\n${util.codeBlock('', guildsAdded.join(', '))}` : '',
				guildsRemoved.length ? `**Guilds Removed**\n${util.codeBlock('', guildsRemoved.join(', '))}` : ''
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
			COMMAND_PING: ping => ({
				fields: [{
					name: `${DISCORD_EMOJI} Ping:`,
					value: 'Pinging Discord...',
				}, {
					name: '💓 Heartbeat:',
					value: `${Math.round(MINUTE / ping)} bpm (1 every ${Math.round(ping)} ms)`,
				}],
				footer: {
					text: "Bots have faster heartbeats than humans, so don't worry if mine is really high!",
				},
			}),
			COMMAND_PING_DESCRIPTION: 'Check my connection to Discord.',
			COMMAND_PINGPONG: (diff, embed) => {
				embed.fields[0].value = `${diff} ms`;
				return embed;
			},
			COMMAND_INVITE: () => [
				`To add ${this.client.user.username} to your discord guild:`,
				this.client.invite,
				util.codeBlock('', [
					'The above link is generated requesting the minimum permissions required to use every command currently.',
					'I know not all permissions are right for every guild, so don\'t be afraid to uncheck any of the boxes.',
					'If you try to use a command that requires more permissions than the bot is granted, it will let you know.'
				].join(' ')),
				'Please file an issue at <https://github.com/dirigeants/klasa> if you find any bugs.'
			],
			COMMAND_INVITE_DESCRIPTION: 'Displays the join guild link of the bot.',
			COMMAND_INFO: () => [
				"Hi! I'm MissyBot!",
				'',
				// eslint-disable-next-line max-len
				`As my name might imply, I'm a Discord bot. I'm based off of the real Missy, ${this.client.missy.tag}. My creator is ${this.client.owner.tag}, he's great! I have a variety of fun commands and responses.`,
				'',
				'For a list of my commands: `Missy, help`',
			],
			COMMAND_INFO_DESCRIPTION: 'Provides some information about me. 🙂',
			COMMAND_HELP_DESCRIPTION: 'Display help for a command.',
			COMMAND_HELP_NO_EXTENDED: 'No extended help available.',
			COMMAND_HELP_DM: '📥 | No problem! I sent you help about my commands.',
			COMMAND_HELP_NODM: '❌ | I couldn\'t DM you :/ If you enable DMs from me, I can send you command help.',
			COMMAND_HELP_OTHER_DM: '📥 | I sent them help about my commands.',
			COMMAND_HELP_OTHER_NODM: '❌ | I couldn\'t DM them :/',
			COMMAND_HELP_PREFIX_NOTE: guildPrefixes => {
				const { noGuildOnlyPrefixes, guildDisabledAPrefix, guildPrefixList } = this.analyzeGuildPrefixes(guildPrefixes);

				return noGuildOnlyPrefixes ? [
					'The prefix is "Missy" (with or without a comma).',
					'\u200b',
				] : [
					'The default prefix is "Missy" (with or without a comma).',
					guildPrefixList.length === 0 ?
						'In that server, however, I will only respond to @mentions.' :
						`In that server, however, you may ${guildDisabledAPrefix ? 'only' : 'also'} use ${guildPrefixList}.`,
					'\u200b',
				];
			},
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
			COMMAND_CONF_SERVER_DESCRIPTION: 'Define per-guild settings.',
			COMMAND_CONF_SERVER: (key, list) => `**guild Settings${key}**\n${list}`,
			COMMAND_CONF_USER_DESCRIPTION: 'Define per-user settings.',
			COMMAND_CONF_USER: (key, list) => `**User Settings${key}**\n${list}`,
			COMMAND_STATS: (memUsage, uptime, users, guilds, channels, klasaVersion, discordVersion, processVersion, message) => [
				'= STATISTICS =',
				'',
				`• Mem Usage  :: ${memUsage} MB`,
				`• Uptime     :: ${uptime}`,
				`• Users      :: ${users}`,
				`• Guilds     :: ${guilds}`,
				`• Channels   :: ${channels}`,
				`• Klasa      :: v${klasaVersion}`,
				`• Discord.js :: v${discordVersion}`,
				`• Node.js    :: ${processVersion}`,
				this.client.options.shardCount ?
					`• Shard      :: ${((message.guild ? message.guild.shardID : message.channel.shardID) || this.client.options.shardId) + 1} / ${this.client.options.shardCount}` :
					''
			],
			COMMAND_STATS_DESCRIPTION: 'Provides some details about the bot and stats.',

			// Custom commands
			COMMAND_PREFIX_DESCRIPTION: 'See the prefixes you can use on this server.',
			COMMAND_SLEEP_DESCRIPTION: 'Tell someone to get their butt to bed!',
			COMMAND_SLEEP: (user, author) => [
				`Go to sleep, ${user}!`,
				`${user}, make sure you're getting enough sleep, little one!`,
				`${user}, ${author} says it's bedtime.`,
				`${user}, get your butt to sleep, little one.`,
				`Please sleep buttercup ${user}`,
			],
			COMMAND_SLEEP_SELF: [
				"But I'm a robot, I don't need to sleep ;-;",
				"You can't tell me to sleep!",
				['Nooooooo', "It's not bedtime yet!"],
				msg => this.client.commands.get('no u').run(msg, []),
			],
			COMMAND_LEWD_NSFW_HINT: '(Psst, try this command in a NSFW channel for a surprise! 🤐)',
			COMMAND_EAT_DESCRIPTION: 'Tell someone to eat.',
			COMMAND_EAT: (something, user, author) => [
				`Eat ${something}, ${user}!`,
				`${user}, make sure you're eating enough, little one!`,
				`${user}, ${author} says to eat ${something}.`,
				`${user}, eat ${something}, little one.`,
			],
			COMMAND_EAT_SELF: [
				"But I'm a robot, I don't need to eat ;-;",
				msg => msg.send(`But I'm already eating. I have ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB of heap memory in my belly.`),
				msg => this.client.commands.get('no-u').run(msg, []),
			],
			COMMAND_FAKEBAN: [
				'Please give them another chance ;-;',
				"Won't you give them another chance? For me?",
				'Awww, are you going to ban them?',
			],
			COMMAND_FAKEKICK: [
				'Aw, do we have to?',
				'Have you tried asking them nicely?',
				"I bet they'll behave from now on. Right?",
			],
			COMMAND_BIRTHDAY_DESCRIPTION: 'Wish someone (or multiple people) a happy birthday 🎂',
			COMMAND_BIRTHDAY: 'Happy birthday!',
			COMMAND_BIRTHDAY_MENTIONS: users => `Happy birthday, ${smartJoin(users)}!`,
			COMMAND_HUG_DESCRIPTION: 'Need a hug? 🙂',
			COMMAND_PAT_DESCRIPTION: 'There, there. ✋🏽',
			COMMAND_MYSWEARS_EXTENDEDHELP: [
				'I see you swearing 👀',
				'',
				"Don't worry, tho, I like swearing. I just have too much self control to do it myself 😛",
			].join('\n'),
			COMMAND_MYSWEARS_NO_UNCENSORED: 'You can only view the uncensored version in a NSFW channel!',
			COMMAND_MYSWEARS_MOD_UNCENSORED: "The uncensored version is normally restricted to NSFW channels, but since you're a mod I'll assume you know what you're doing.",
			COMMAND_SEND_DESCRIPTION: 'Ask me to send something.',
			COMMAND_SEND_EXTENDEDHELP: "If you don't mention anyone, I'll just send it here, or to you.",
			COMMAND_SEND_MISSING_WHAT: "You didn't tell me what to send!",
			COMMAND_SEND_POTATO: 'Sent them a potato 👌',
			COMMAND_SEND_MARBLES: 'I seem to have lost all of mine @_@',
			COMMAND_SEND_UNKNOWN: "I don't know how to send that >_<",
			COMMAND_NOU_EXTENDEDHELP: examples => [
				"I'm sorry for the cluttered usage.",
				'Examples:',
				...examples,
			],
			COMMAND_NOU_LOADING_TEXT: 'Rebutting your argument...',
		};
	}

	analyzeGuildPrefixes(guildPrefixes) {
		// Global prefixes (but guilds can still disable them)
		const prefixes = ensureArray(this.client.options.prefix);

		// Some logic
		const guildDisabledAPrefix = prefixes.some(p => !guildPrefixes.includes(p));
		const noGuildOnlyPrefixes = !guildDisabledAPrefix && guildPrefixes.length === prefixes.length;

		// Build the string list of prefixes
		let guildPrefixList = guildPrefixes;
		if (!guildDisabledAPrefix) guildPrefixList = guildPrefixList.filter(p => !prefixes.includes(p));
		guildPrefixList = smartJoin(guildPrefixList.map(p => `\`${p}\``));

		return { noGuildOnlyPrefixes, guildDisabledAPrefix, guildPrefixList };
	}

	async init() {
		await super.init();
	}

};
