import MissyClient from './lib/MissyClient';
import { readJSON } from 'fs-nextra';

console.log(process.cwd());

readJSON('config.json')
	.then(({ token }: { token: string }) => new MissyClient().login(token))
	.catch((e: Error) => {
		console.error('Failed to start bot:', e);
		process.exit(1);
	});
