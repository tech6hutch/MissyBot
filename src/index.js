const { token } = require('../config');

const MissyClient = require('./lib/MissyClient');

new MissyClient().login(token);
