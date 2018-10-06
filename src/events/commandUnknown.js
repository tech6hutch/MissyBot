const { Event } = require('klasa');
const { capitalizeFirstLetter, arrayRandom } = require('../lib/util');

module.exports = class UnknownCmd extends Event {

  constructor(...args) {
    super(...args);

    this.unknownUnknown = [
      "I don't know what that means, sorry @_@",
      "I'm so confused @_@",
      "I'm too dumb, sorry XD",
      "I'm a potato!",
    ];

    this.mentionRegex = null;
    this.missyRegex = null;
  }

  init() {
    const mention = `<@!?${this.client.user.id}>`;
    this.mentionRegex = new RegExp(mention);
    this.missyRegex = new RegExp(`missy|${mention}`, 'gi');
  }

  run(msg, command) {
    switch (command) {
      case 'missy':
      case `<@${this.client.user.id}>`:
      case `<@!${this.client.user.id}>`: {
        const whats = msg.content.match(this.missyRegex)
          .map(UnknownCmd.missiesToWhats(this.mentionRegex))
          .join(' ');
        return msg.send(`${whats}?`);
      }

      case 'marbles': return msg.send("They're nice, and all, but I seem to have lost all of mine @_@");

      default: return msg.send(arrayRandom(this.unknownUnknown));
    }
  }

  static missiesToWhats(mentionRegex) {
    const what = 'what';
    return (missy, i) => mentionRegex.test(missy) ?
      (i === 0 ? capitalizeFirstLetter(what) : what) :
      what.split('').map(UnknownCmd.missyCase(missy, what)).join('');
  }

  static missyCase(missy, what) {
    const lastIndex = what.length - 1;
    return (w, i) => {
      // For the last letter of "what", use the case of the last letter of "missy"
      const m = i === lastIndex ? missy[missy.length - 1] : missy[i];
      return m === m.toUpperCase() ? w.toUpperCase() : w;
    };
  }

};
