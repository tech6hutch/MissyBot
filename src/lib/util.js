const { util: { sleep } } = require('klasa');

class Util {

  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
  }

  static arrayRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
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

}

module.exports = Util;
