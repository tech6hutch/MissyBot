import { Serializer, SchemaEntry, Language } from 'klasa';

export default class extends Serializer {

	async deserialize(data: any, entry: SchemaEntry, language: Language): Promise<bigint> {
		if (typeof data === 'bigint') return data;
		try {
			return BigInt(data);
		} catch (_) {
			throw language.get('RESOLVER_INVALID_INT', entry.key);
		}
	}

	serialize(data: bigint) {
		return data.toString();
	}

}
