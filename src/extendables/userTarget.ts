import { KlasaUser, Extendable, ExtendableStore } from 'klasa';
import MissyClient from '../lib/MissyClient';

declare module 'klasa' {
	export interface KlasaUser {
		target: KlasaUser | undefined;
		startTargeting(target: KlasaUser): void;
		/**
	  * @returns whether the user was targeting anyone
	  */
		stopTargeting(): boolean;
	}
}

export default class extends Extendable {

	constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [KlasaUser] });
	}

	get target(this: KlasaUser): KlasaUser | undefined {
		this.client.emit('log', `got the target of ${this.username}`);
		return (this.client as MissyClient).userTargets.get(this);
	}

	startTargeting(this: KlasaUser, target: KlasaUser) {
		this.client.emit('log', `user ${this.username} started targeting ${target.username}`);
		(this.client as MissyClient).userTargets.set(this, target);
	}

	stopTargeting(this: KlasaUser): boolean {
		this.client.emit('log', `user ${this.username} stopped targeting, if they were`);
		return (this.client as MissyClient).userTargets.delete(this);
	}

}
