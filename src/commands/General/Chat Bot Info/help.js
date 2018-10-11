const { Command, util: { isFunction } } = require('klasa');
const { scalarOrFirst, ensureArray, smartJoin } = require('../../../lib/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands'],
			guarded: true,
			description: language => language.get('COMMAND_HELP_DESCRIPTION'),
			usage: '(Command:command)'
		});

		this.createCustomResolver('command', (arg, possible, message) => {
			if (!arg || arg === '') return undefined;
			return this.client.arguments.get('command').run(arg, possible, message);
		});
	}

	async run(message, [command]) {
		return this.sendHelp(message, command);
	}

	async sendHelp(msg, command, toChannel = command ? msg : msg.author, {
		doneText = msg.language.get('COMMAND_HELP_DM'),
		failText = msg.language.get('COMMAND_HELP_NODM'),
	} = {}) {
		if (command) {
			const info = [
				`= ${command.name} = `,
				isFunction(command.description) ? command.description(msg.language) : command.description,
				msg.language.get('COMMAND_HELP_USAGE', command.usage.fullUsage(msg)),
				msg.language.get('COMMAND_HELP_EXTENDED'),
				isFunction(command.extendedHelp) ? command.extendedHelp(msg.language) : command.extendedHelp
			].join('\n');
			return toChannel.send(info, { code: 'asciidoc' });
		}

		const prefixes = ensureArray(this.client.options.prefix);
		const guildPrefixes = msg.guildSettings.prefix;
		const guildDisabledAPrefix = prefixes.some(p => !guildPrefixes.includes(p));
		const noGuildOnlyPrefixes = !guildDisabledAPrefix && guildPrefixes.length === prefixes.length;
		const help = await this.buildHelp(msg);
		const categories = Object.keys(help);
		let guildPrefixList = guildPrefixes;
		if (!guildDisabledAPrefix) guildPrefixList = guildPrefixList.filter(p => !prefixes.includes(p));
		guildPrefixList = smartJoin(guildPrefixList.map(p => `\`${p}\``));
		const helpMessage = noGuildOnlyPrefixes ? [
			'The prefix is "Missy" (with or without a comma).',
			'\u200b',
		] : [
			'The default prefix is "Missy" (with or without a comma).',
			guildPrefixList.length === 0 ?
				'In that server, however, I will only respond to @mentions.' :
				`In that server, however, you may ${guildDisabledAPrefix ? 'only' : 'also'} use ${guildPrefixList}.`,
			'\u200b',
		];
		for (let cat = 0; cat < categories.length; cat++) {
			helpMessage.push(`**${categories[cat]} Commands**:`, '```asciidoc');
			const subCategories = Object.keys(help[categories[cat]]);
			for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`= ${subCategories[subCat]} =`, `${help[categories[cat]][subCategories[subCat]].join('\n')}\n`);
			helpMessage.push('```', '\u200b');
		}

		return toChannel.send(helpMessage, { split: { char: '\u200b' } })
			.then(() => { if (msg.channel.type !== 'dm') msg.send(doneText); })
			.catch(() => { if (msg.channel.type !== 'dm') msg.send(failText); });
	}

	async buildHelp(message) {
		const help = {};

		const prefix = scalarOrFirst(this.client.options.prefix);
		const commandNames = [...this.client.commands.keys()];
		const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

		await Promise.all(this.client.commands.map((command) =>
			this.client.inhibitors.run(message, command, true)
				.then(() => {
					if (!help.hasOwnProperty(command.category)) help[command.category] = {};
					if (!help[command.category].hasOwnProperty(command.subCategory)) help[command.category][command.subCategory] = [];
					const description = isFunction(command.description) ? command.description(message.language) : command.description;
					help[command.category][command.subCategory].push(`${prefix} ${command.name.padEnd(longest)} :: ${description}`);
				})
				.catch(() => {
					// noop
				})
		));

		return help;
	}

};