const { Inhibitor } = require('klasa');

module.exports = class NonMissyInhibitor extends Inhibitor {

	constructor(...args) {
		super(...args);

		this.allowedIDs = [];
	}

	init() {
		this.allowedIDs.push(this.client.owner.id, this.client.missyID);
	}

	async run(msg, cmd) {
		return this.allowedIDs.includes(msg.author.id) || cmd.subCategory !== "Missy's Commands" ?
			undefined :
			true;
	}

};
