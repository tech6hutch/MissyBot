import {
	Language,
} from 'klasa';
import MissyClient from '../../MissyClient';

export default abstract class MissyLanguage extends Language {

	// @ts-ignore assigned in the parent class
	readonly client: MissyClient;

}
