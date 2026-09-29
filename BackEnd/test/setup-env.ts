/**
 * Environment for e2e/integration tests. Real process env wins over .env,
 * so these values override a developer's local configuration.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-access-secret-0123456789-0123456789';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-0123456789-0123456789';
process.env.AUTH_RATE_LIMIT ??= '1000';
process.env.FRONTEND_URL ??= 'http://localhost:5173';
