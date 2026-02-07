/**
 * Jest global setup — runs before every test suite.
 * Stubs environment variables required by modules that throw on missing config.
 */

// PHI encryption requires a 32-byte key at import time; stub a deterministic
// test key (64-char hex = 32 bytes) so unit tests don't blow up.
process.env.PHI_ENCRYPTION_KEY ??= '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.PHI_ENCRYPTION_KEY_ID ??= 'test-k1';
