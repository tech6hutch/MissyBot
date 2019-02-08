import { Store, Piece, KlasaClient } from 'klasa';

/**
 * Stores all the...anything that's an object that I wanna be able to reload
 * @extends Store
 */
class ObjectStore extends Store<string, Piece> {

	/**
	 * Constructs our ObjectStore for use in MissyBot :>
	 * @param client The klasa client initializing this store.
	 */
	constructor(client: KlasaClient) {
		// super(client, 'objects', Object); this isn't gonna work
		super(client, 'objects', <any>Piece);
	}

}

export default ObjectStore;
