import { Piece } from 'klasa';
import { mixinify } from '../../util/mixin';

if (!(<any>Piece).mixin) (<any>Piece).mixin = mixinify(<any>Piece);

export default (<any>Piece).mixin;
