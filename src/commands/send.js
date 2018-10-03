const { Command } = require('klasa');

module.exports = class SendCmd extends Command {

  constructor(...args) {
    super(...args, {
      description: 'Ask me to send something.',
      usage: '<what:str>',
    });
  }

  run(msg, [what]) {
    switch (what) {
      case 'nudes':
      case 'noods':
        return this.client.commands.get('lewd').run(msg);

      default:
        return msg.send("I don't know how to send that >_<");
    }
  }

};
