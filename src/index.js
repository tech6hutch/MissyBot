const { token } = require('../config');

const MissyClient = require('./lib/MissyClient');

const client = new MissyClient();
client.login(token);

module.exports = client;
