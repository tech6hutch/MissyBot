const { token } = require('../config');

const { Client } = require('klasa');

new Client({
	prefix: ['Missy,', 'Missy'],
	prefixCaseInsensitive: true,
	commandEditing: true,
	noPrefixDM: true,
}).login(token);
