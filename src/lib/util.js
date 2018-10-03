class Util {

  static arrayRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

}

module.exports = Util;
