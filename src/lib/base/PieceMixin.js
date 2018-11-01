const { Piece } = require('klasa');
const { mixinify } = require('../util/mixin');

if (!Piece.mixin) Piece.mixin = mixinify(Piece);

module.exports = Piece.mixin;
