// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
import fetch from 'node-fetch';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../../lib/MissyClient';
import MissyCommand from '../../../lib/structures/base/MissyCommand';
import { arrayRandom } from '../../../lib/util/util';

export default class extends MissyCommand {

	client: MissyClient;

	catEmojis = ['🐱', '🐈'];

	constructor(client: MissyClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['randomcat', 'meow', 'pussy'],
			description: lang => lang.get('COMMAND_CAT_DESCRIPTION'),
		});
	}

	async run(msg: KlasaMessage) {
		return msg.sendLoading(async () => {
			const file = await fetch('http://aws.random.cat/meow')
				.then(response => response.json())
				.then(body => body.file);
			return msg.sendEmbed(new MessageEmbed()
				.setColor(this.client.COLORS.BLUE)
				.setTitle('Kitty!')
				.setURL(file)
				.setDescription(`[${arrayRandom(this.catEmojis)}](${file})`)
				.setImage(file)
				.setFooter('Powered by random.cat', 'https://purr.objects-us-west-1.dream.io/static/ico/favicon-32x32.png'));
		});
	}

}
