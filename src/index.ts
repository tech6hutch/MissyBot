import MissyClient from './lib/MissyClient';
import { readJSON } from 'fs-nextra';

readJSON('../config.json')
	.then(({ token }: { token: string }) => new MissyClient().login(token));
