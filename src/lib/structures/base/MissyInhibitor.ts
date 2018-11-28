import {
	Inhibitor,
} from 'klasa';
import MissyClient from '../../MissyClient';

export default abstract class MissyInhibitor extends Inhibitor {

	// @ts-ignore assigned in the parent class
	readonly client: MissyClient;

}
