import {
	Event,
} from 'klasa';
import MissyClient from '../../MissyClient';

export default abstract class MissyEvent extends Event {

	// @ts-ignore assigned in the parent class
	readonly client: MissyClient;

}
