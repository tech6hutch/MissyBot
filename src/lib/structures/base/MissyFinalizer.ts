import {
	Finalizer,
} from 'klasa';
import MissyClient from '../../MissyClient';

export default abstract class MissyFinalizer extends Finalizer {

	// @ts-ignore assigned in the parent class
	readonly client: MissyClient;

}
