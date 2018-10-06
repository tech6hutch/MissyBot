const { Command } = require('klasa');

module.exports = class SendCmd extends Command {

  constructor(...args) {
    super(...args, {
      description: 'Ask me to send something.',
      usage: '<what:str> [to] [whom:mention]',
      usageDelim: ' ',
      extendedHelp: "If you don't mention anyone, I'll just send it here.",
    });

    this.customizeResponse('what', "You didn't tell me what to send!");
  }

  async run(msg, [what, to, whom = msg]) {
    const local = msg === whom;

    switch (what) {
      case 'help': {
        const helpCmd = this.client.commands.get('help');

        if (local) return helpCmd.run(msg, []);

        // Copy-pasted from help command xD TODO: just transfer the help cmd & change it
        const help = await helpCmd.buildHelp(msg);
        const categories = Object.keys(help);
        const helpMessage = [];
        for (let cat = 0; cat < categories.length; cat++) {
          helpMessage.push(`**${categories[cat]} Commands**:`, '```asciidoc');
          const subCategories = Object.keys(help[categories[cat]]);
          for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`= ${subCategories[subCat]} =`, `${help[categories[cat]][subCategories[subCat]].join('\n')}\n`);
          helpMessage.push('```', '\u200b');
        }

        return whom.send(helpMessage, { split: { char: '\u200b' } })
          .then(() => msg.send('📥 | I sent them help about my commands.'))
          .catch(() => msg.send('❌ | I couldn\'t DM them :/'));
      }

      case 'nudes':
      case 'noods':
        return local ?
          this.client.commands.get('lewd').postSfwImage(msg) :
          this.client.commands.get('lewd').postSfwImageSomewhere(msg, whom);

      case 'potato': {
        const potatoP = this.client.commands.get('potato').run(whom);
        return local ? potatoP : msg.send('Sent them a potato 👌');
      }

      case 'marbles': return msg.send('I seem to have lost all of mine @_@');

      default:
        return msg.send("I don't know how to send that >_<");
    }
  }

};
