const { Event } = require('klasa');

module.exports = class extends Event {

	async run(reaction, user) {
		const { message: msg } = reaction;
		if (msg.author !== this.client.user ||
			![this.client.owner.id, this.client.missyID].includes(user.id) ||
			reaction.emoji.name !== '🗑' ||
			msg.deleted ||
			!msg.deletable) return;

		msg.delete({ reason: 'deleted by one of the bot\'s devs' });
	}

};
