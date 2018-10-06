const { join } = require('path');
const { Command } = require('klasa');
const { arrayRandom, postImage, postImageSomewhere } = require('../lib/util');

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

  postSfwImage(channel) {
    return postImage(channel, this.sfwImage);
  }
  postSfwImageSomewhere(hereChan, toChan) {
    return postImageSomewhere(hereChan, toChan, this.sfwImage);
  }

  postNsfwImage(channel, imageName) {
    return this._postNsfwImage(true, channel, null, imageName);
  }
  postNsfwImageSomewhere(hereChan, toChan, imageName) {
    return this._postNsfwImage(false, hereChan, toChan, imageName);
  }
  _postNsfwImage(postHere, hereChan, toChan, imageName) {
    const image = this.nsfwImages[imageName] ||
      this.nsfwImages[this.nsfwImageNames.find(name => name.startsWith(imageName))];
    if (!image) return hereChan.send("That image doesn't exist");
    return postHere ?
      postImage(hereChan, image, {loadingText: '<.<\n>.>'}) :
      postImageSomewhere(hereChan, toChan, image, {loadingText: '<.<\n>.>'});
  }

};
