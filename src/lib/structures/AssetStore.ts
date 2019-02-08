import { Store } from 'klasa';
import MissyClient from '../MissyClient';
import Asset from './Asset';

/**
 * Stores all the assets, such as images, for easy loading
 * @extends Store
 */
class AssetStore extends Store<string, Asset> {

	/**
	 * Constructs our AssetStore for use in MissyBot :>
	 * @param client The klasa client initializing this store.
	 */
	constructor(client: MissyClient) {
		super(client, 'assets', Asset);
	}

}

export default AssetStore;
