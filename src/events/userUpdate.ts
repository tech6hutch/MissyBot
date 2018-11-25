import assert from 'assert';
import { Event, KlasaUser } from 'klasa';
import MissyClient from '../lib/MissyClient';

export default class extends Event {

	client: MissyClient;

	async run(oldUser: KlasaUser, newUser: KlasaUser) {
		assert(oldUser.id === newUser.id);
		return newUser.id === this.client.missyID && oldUser.avatar !== newUser.avatar &&
			this.copyUserAvatar(newUser);
	}

	copyUserAvatar(user: KlasaUser) {
		return this.client.user!.setAvatar(user.displayAvatarURL({ size: 2048, format: 'png' }));
	}

}
