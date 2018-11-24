import { Serializer, SchemaPiece, Language } from 'klasa';

export default class extends Serializer {

	deserialize(data: any, piece: SchemaPiece, language: Language): Promise<bigint> {
		// @ts-ignore WHY THE FUCK BIGINT NOT WORK? My tsconfig is right...
		if (data instanceof BigInt) return data;
		try {
			// @ts-ignore WHY THE FUCK BIGINT NOT WORK?
			return BigInt(data);
		} catch (_) {
			throw language.get('RESOLVER_INVALID_INT', piece.key);
		}
	}

	serialize(data: bigint) {
		return data.toString();
	}

}
