const { join } = require('path');
const { Command } = require('klasa');
const { arrayRandom } = require('../lib/util');

module.exports = class LewdCmd extends Command {

  constructor(...args) {
    super(...args, {
      description: 'Nice try. 😝',
      usage: '[image-name:str]',
    });

    const sfwImageName = 'nice-try.png';
    this.sfwImage = {
      attachment: join(process.cwd(), 'assets', sfwImageName),
      name: sfwImageName,
    };
    this.nsfwImageNames = [
      'send-nudes.png',
      'lewd-potato.png',
      'succubus.png',
      'lust.png',
    ];
    this.nsfwImages = this.nsfwImageNames.reduce(
      (images, filename) => (images[filename] = {
        attachment: join(process.cwd(), 'assets', filename),
        name: filename,
      }, images),
      {}
    );
  }

  async run(msg, [imageName = arrayRandom(this.nsfwImageNames)]) {
    if (msg.channel.nsfw) {
      await this.postNsfwImage(msg, imageName);
    } else {
      await this.postSfwImage(msg);
      if (Math.random() < 0.05) msg.channel.send('(Psst, try this command in a NSFW channel for a surprise! 🤐)');
    }
  }

  postSfwImage(msg) {
    return LewdCmd.postImage(msg, this.sfwImage);
  }

  postNsfwImage(msg, imageName) {
    const image = this.nsfwImages[imageName] ||
      this.nsfwImages[this.nsfwImageNames.find(name => name.startsWith(imageName))];
    if (!image) return msg.send("That image doesn't exist");

    return LewdCmd.postImage(msg, image, '<.<\n>.>');
  }

  static async postImage(msg, image, loadingText = 'Just a moment.') {
    const loadingMsg = await msg.send(loadingText);
    await msg.channel.send({
      files: [image],
    });
    await loadingMsg.delete();
  }

};
