const { token } = require('../config');

const MissyClient = require('./lib/MissyClient');

new MissyClient({
	prefix: ['Missy,', 'Missy'],
	prefixCaseInsensitive: true,
	commandEditing: true,
	noPrefixDM: true,
}).login(token);
