import assert from 'assert';
import { KlasaUser } from 'klasa';
import MissyEvent from '../lib/structures/base/MissyEvent';

export default class extends MissyEvent {

	async run(oldUser: KlasaUser, newUser: KlasaUser) {
		assert(oldUser.id === newUser.id);
		return newUser.id === this.client.missyID && oldUser.avatar !== newUser.avatar &&
			this.copyUserAvatar(newUser);
	}

	copyUserAvatar(user: KlasaUser) {
		return this.client.user!.setAvatar(user.displayAvatarURL({ size: 2048, format: 'png' }));
	}

}
