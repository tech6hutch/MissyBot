const { Event } = require('klasa');
const { arrayRandom } = require('../lib/util');

module.exports = class UnknownCmd extends Event {

  constructor(...args) {
    super(...args);

    this.responses = [
      "I don't know what that means, sorry @_@",
      "I'm so confused @_@",
    ];
  }

  run(msg, command) {
    return msg.send(arrayRandom(this.responses));
  }

};
