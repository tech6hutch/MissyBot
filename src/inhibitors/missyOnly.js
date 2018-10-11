const { Inhibitor } = require('klasa');

class MissyInhibitor extends Inhibitor {

	async run(msg, cmd) {
		if (cmd.subCategory === "Missy's Commands" && msg.author.id !== MissyInhibitor.missyID) return true;
		return undefined;
	}

}

MissyInhibitor.missyID = '398127472564240387';

module.exports = MissyInhibitor;
