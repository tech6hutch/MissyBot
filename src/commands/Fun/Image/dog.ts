// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
import fetch from 'node-fetch';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import MissyClient from '../../../lib/MissyClient';
import MissyCommand from '../../../lib/structures/base/MissyCommand';
import { arrayRandom } from '../../../lib/util/util';

export default class extends MissyCommand {

	dogEmojis = ['🐶', '🐕', '🐩'];

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['randomdog', 'woof', 'bitch'],
			description: lang => lang.get('COMMAND_DOG_DESCRIPTION'),
		});
	}

	run(msg: KlasaMessage) {
		return msg.sendLoading(async () => {
			const file = await fetch('https://dog.ceo/api/breeds/image/random')
				.then(response => response.json())
				.then(body => body.message);
			return msg.sendEmbed(new MessageEmbed()
				.setColor(this.client.COLORS.BLUE)
				.setTitle('Doggy!')
				.setURL(file)
				.setDescription(`[${arrayRandom(this.dogEmojis)}](${file})`)
				.setImage(file)
				.setFooter('Powered by Dog API: https://dog.ceo/dog-api/', 'https://dog.ceo/img/favicon.png'));
		});
	}

}
