const { Inhibitor } = require('klasa');

class MissyInhib extends Inhibitor {

	async run(msg, cmd) {
		if (cmd.subCategory === "Missy's Commands" && msg.author.id !== MissyInhib.missyID) return true;
		return undefined;
	}

}

MissyInhib.missyID = '398127472564240387';

module.exports = MissyInhib;
