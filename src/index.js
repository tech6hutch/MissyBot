const { token } = require('../config');

const { Client } = require('klasa');

new Client({
  prefix: 'missy',
  commandEditing: true,
}).login(token);
