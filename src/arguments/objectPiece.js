const { Argument } = require('klasa');

module.exports = class extends Argument {

	constructor(...args) {
		super(...args, { enabled: false });
	}

	run(arg, possible, message) {
		const object = this.client.objects.get(arg);
		if (object) return object;
		throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'object');
	}

};
