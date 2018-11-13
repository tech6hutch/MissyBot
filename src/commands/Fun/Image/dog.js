// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');
const { arrayRandom } = require('../../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['randomdog', 'woof', 'bitch'],
			description: lang => lang.get('COMMAND_DOG_DESCRIPTION'),
		});
		this.dogEmojis = ['🐶', '🐕', '🐩'];
	}

	run(msg) {
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

};
