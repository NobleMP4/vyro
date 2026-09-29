import 'dotenv/config';
import '../setup-env';
import { getTestDatabaseUrl } from './test-database';

process.env.DATABASE_URL = getTestDatabaseUrl();
