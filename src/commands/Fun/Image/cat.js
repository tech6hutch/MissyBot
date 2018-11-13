// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');
const { arrayRandom } = require('../../../lib/util/util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['randomcat', 'meow', 'pussy'],
			description: lang => lang.get('COMMAND_CAT_DESCRIPTION'),
		});
		this.catEmojis = ['🐱', '🐈'];
	}

	async run(msg) {
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

};
