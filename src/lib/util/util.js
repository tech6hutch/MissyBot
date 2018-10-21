const { util: { sleep } } = require('klasa');

class Util {

	/**
	 * @param {string} string The string to capitalize
	 * @returns {string}
	 */
	static capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.substring(1);
	}

	/**
	 * @param {*} arrayOrScalar Something that may or may not be an array
	 * @returns {*} Not an array (unless the array contained arrays, of course)
	 */
	static scalarOrFirst(arrayOrScalar) {
		return Array.isArray(arrayOrScalar) ? arrayOrScalar[0] : arrayOrScalar;
	}

	/**
	 * @param {*} arrayOrScalar Something that may or may not be an array
	 * @returns {*[]} Definitely an array
	 */
	static ensureArray(arrayOrScalar) {
		return Array.isArray(arrayOrScalar) ? arrayOrScalar : [arrayOrScalar];
	}

	/**
	 * @param {*[]} array An array to retrieve a random element from
	 * @returns {*}
	 */
	static arrayRandom(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	/**
	 * @param {string[]} array An array of strings
	 * @param {string} lastSep Used to separate the last item from the previous
	 * @param {string} sep Used to separate items
	 * @returns {string}
	 */
	static smartJoin(array, lastSep = 'and', sep = ',') {
		return Util.arrayJoin(array, `${sep} `, `${lastSep} `);
	}

	/**
	 * @param {string[]} array An array of strings
	 * @param {string} sep Used to separate items
	 * @param {string} beforeLast Inserted before the last item
	 * @returns {string}
	 */
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

	/**
	 * @param {number} min Minimum (inclusive)
	 * @param {number} max Maximum (inclusive)
	 * @returns {number}
	 */
	static randomBetween(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * @param {"short"|"medium"|"long"} [length=medium] How long the pause should be
	 * @returns {Promise<void>}
	 */
	static naturalPause(length = 'medium') {
		return sleep({
			short: Util.randomBetween(500, 1500),
			medium: Util.randomBetween(1600, 2500),
			long: Util.randomBetween(2600, 5000),
		}[length]);
	}

	// Discord.js stuff

	/**
	 * @param {TextChannel} channel The channel to post in
	 * @param {FileOptions} image The image to post (see: https://discord.js.org/#/docs/main/master/typedef/FileOptions)
	 * @param {Object} options Extra options
	 * @param {string} [options.loadingText=Just a moment.] Text to send before the image
	 * @param {string} [options.imageText=] Text to send with the image message
	 * @returns {Promise<KlasaMessage>}
	 */
	static async postImage(channel, image, {
		loadingText = 'Just a moment.',
		imageText = '',
	} = {}) {
		const loadingMsg = await channel.send(loadingText);
		const imgMsg = await channel.send(imageText, {
			files: [image],
		});
		await loadingMsg.delete();
		return imgMsg;
	}

	/**
	 * @param {TextChannel} hereChan The channel the command originated in
	 * @param {TextChannel} toChan The channel to post in
	 * @param {FileOptions} image The image to post (see: https://discord.js.org/#/docs/main/master/typedef/FileOptions)
	 * @param {Object} options Extra options
	 * @param {string} [options.loadingText=Just a moment.] Text to send before the image
	 * @param {string} [options.imageText=] Text to send with the image message
	 * @param {string} [options.doneText=Sent the image 👌] Text to send to hereChan after the image sends
	 * @returns {Promise<[KlasaMessage, KlasaMessage]>}
	 */
	static async postImageSomewhere(hereChan, toChan, image, {
		loadingText = 'Just a moment.',
		imageText = '',
		doneText = 'Sent the image 👌',
	} = {}) {
		if (hereChan === toChan) throw 'Incorrect usage';
		await hereChan.send(loadingText);
		const imgMsg = await toChan.send(imageText, {
			files: [image],
		});
		return [await hereChan.send(doneText), imgMsg];
	}

}

module.exports = Util;
