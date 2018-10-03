const { join } = require('path');
const { Command } = require('klasa');
const { arrayRandom } = require('../lib/util');

module.exports = class LewdCmd extends Command {

  constructor(...args) {
    super(...args, {
      description: 'Nice try. 😝',
    });

    const filename = 'nice-try.png';
    this.file = {
      attachment: join(process.cwd(), 'assets', filename),
      name: filename,
    };
  }

  async run(msg) {
    // TODO: if NSFW channel, have slight chance of something else
    const loadingMsg = await msg.send('Just a moment.');
    await msg.channel.send({
      files: [this.file],
    });
    loadingMsg.delete();
  }

};
