/**
 * Jest setup for Beads integration tests
 */

// Mock environment variables
process.env.BEADS_INTEGRATION_ENABLED = 'true';
process.env.BEADS_SYNC_URL = 'http://localhost:3100';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Global test timeout
jest.setTimeout(10000);

// Suppress console.error during tests (optional)
// global.console.error = jest.fn();

// Mock console.log for cleaner test output
global.console.log = jest.fn();
