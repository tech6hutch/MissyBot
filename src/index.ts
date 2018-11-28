import assert from 'assert';
import { readJSON } from 'fs-nextra';
import MissyClient from './lib/MissyClient';

readJSON('config.json')
	.then(({ token }: { token?: string }) => {
		assert(token);
		new MissyClient().login(token);
	})
	.catch((e: any) => {
		console.error('Failed to start bot:', e);
		process.exit(1);
	});
