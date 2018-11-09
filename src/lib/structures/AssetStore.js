const { Store } = require('klasa');
const Asset = require('./Asset');

/**
 * Stores all the assets, such as images, for easy loading
 * @extends Store
 */
class AssetStore extends Store {

	/**
	 * Constructs our AssetStore for use in MissyBot :>
	 * @param {MissyClient} client The klasa client initializing this store.
	 */
	constructor(client) {
		super(client, 'assets', Asset);
	}

}

module.exports = AssetStore;
