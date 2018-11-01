const { Store } = require('klasa');

/**
 * Stores all the...anything that's an object that I wanna be able to reload
 * @extends Store
 */
class ObjectStore extends Store {

	/**
	 * Constructs our ObjectStore for use in MissyBot :>
	 * @param {KlasaClient} client The klasa client initializing this store.
	 */
	constructor(client) {
		super(client, 'objects', Object);
	}

}

module.exports = ObjectStore;
