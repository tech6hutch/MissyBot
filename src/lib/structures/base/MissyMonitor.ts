import {
	Monitor,
} from 'klasa';
import MissyClient from '../../MissyClient';

export default abstract class MissyMonitor extends Monitor {

	// @ts-ignore assigned in the parent class
	readonly client: MissyClient;

}
