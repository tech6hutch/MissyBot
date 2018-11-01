const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	constructor(...args) {
		super(...args);

		this.allowedIDs = [];
	}

	init() {
		this.allowedIDs.push(
			this.client.owner.id,
			this.client.missyID,
		);
		const moonbeamID = '214442156788678658';
		if (this.client.users.has(moonbeamID)) this.allowedIDs.push(moonbeamID);
	}

	async run(msg, cmd) {
		return this.allowedIDs.includes(msg.author.id) || cmd.subCategory !== "Missy's Commands" ?
			undefined :
			true;
	}

};
