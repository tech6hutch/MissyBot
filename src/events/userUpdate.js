const assert = require('assert');
const { Event } = require('klasa');

module.exports = class extends Event {

	async run(oldUser, newUser) {
		assert(oldUser.id === newUser.id);
		if (newUser.id !== this.client.missyID || oldUser.avatar === newUser.avatar) return;

		this.copyUserAvatar(newUser);
	}

	copyUserAvatar(user) {
		return this.client.user.setAvatar(user.displayAvatarURL({ size: 2048, format: 'png' }));
	}

};
