const { util: { sleep } } = require('klasa');

class Util {

  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
  }

  static scalarOrFirst(arrayOrScalar) {
    return Array.isArray(arrayOrScalar) ? arrayOrScalar[0] : arrayOrScalar;
  }

  static ensureArray(arrayOrScalar) {
    return Array.isArray(arrayOrScalar) ? arrayOrScalar : [arrayOrScalar];
  }

  static arrayRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static smartJoin(array, lastSep = 'and', sep = ',') {
    return Util.arrayJoin(array, `${sep} `, `${lastSep} `);
  }
  static arrayJoin(array, sep = ',', beforeLast = '') {
    switch (array.length) {
      case 0: return '';
      case 1: return String(array[0]);
      case 2: return `${array[0]} ${beforeLast}${array[1]}`;
    }
    const lastIndex = array.length - 1;
    const secondLastIndex = lastIndex - 1;
    return array.reduce(
      (joined, str, i) => joined +
        (i === lastIndex ? String(str) : `${str}${sep}${i === secondLastIndex ? beforeLast : ''}`),
      ''
    );
  }

  static randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static naturalPause(length = 'medium') {
    return sleep({
      short: Util.randomBetween(500, 1500),
      medium: Util.randomBetween(1600, 2500),
      long: Util.randomBetween(2600, 5000),
    }[length]);
  }

  // Discord.js stuff

  static async postImage(channel, image, {
      loadingText = 'Just a moment.',
      imageText = '',
  }) {
    const loadingMsg = await channel.send(loadingText);
    const imgMsg = await channel.send(imageText, {
      files: [image],
    });
    await loadingMsg.delete();
    return imgMsg;
  }

  static async postImageSomewhere(hereChan, toChan, image, {
    loadingText = 'Just a moment.',
    imageText = '',
    doneText = 'Sent the image 👌',
  }) {
    if (hereChan === toChan) throw 'Incorrect usage';
    await hereChan.send(loadingText);
    const imgMsg = await toChan.send(imageText, {
      files: [image],
    });
    return [await hereChan.send(doneText), imgMsg];
  }

}

module.exports = Util;
