const { Command } = require('klasa');

module.exports = class SendCmd extends Command {

  constructor(...args) {
    super(...args, {
      description: 'Ask me to send something.',
      usage: '<what:str> [to] [whom:mention]',
      usageDelim: ' ',
      extendedHelp: "If you don't mention anyone, I'll just send it here.",
    });
  }

  run(msg, [what, to, whom = msg]) {
    // Sanity check (TODO: remove, once proven successful)
    console.assert(to ? to === 'to' : true);

    switch (what) {
      case 'nudes':
      case 'noods':
        // TODO: update this to accept other destinations than just the current channel
        return this.client.commands.get('lewd').run(msg, []);
      
      case 'potato': return this.client.commands.get('potato').run(msg);

      default:
        return msg.send("I don't know how to send that >_<");
    }
  }

};
