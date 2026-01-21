/**
 * Password Utils Tests - Bcrypt Migration
 *
 * Verifies:
 * 1. Legacy SHA256 verification works
 * 2. Bcrypt verification works
 * 3. Auto-detection based on hash prefix
 * 4. needsUpgrade flag is correct
 * 5. hashPassword always returns bcrypt
 */

import { hashPassword, verifyPassword } from '../passwordUtils';
import { createHash } from 'crypto';

// Helper to create legacy SHA256 hash (same as old hashPassword)
function createLegacyHash(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
}

describe('passwordUtils', () => {
  describe('hashPassword', () => {
    it('should return a bcrypt hash', async () => {
      const hash = await hashPassword('testpassword');

      // Bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should return different hashes for same password (salted)', async () => {
      const hash1 = await hashPassword('testpassword');
      const hash2 = await hashPassword('testpassword');

      expect(hash1).not.toBe(hash2);
    });

    it('should use cost factor 12', async () => {
      const hash = await hashPassword('testpassword');

      // Bcrypt hash format: $2b$12$... where 12 is the cost
      expect(hash).toMatch(/^\$2[aby]\$12\$/);
    });
  });

  describe('verifyPassword', () => {
    describe('with bcrypt hash', () => {
      it('should return ok=true for correct password', async () => {
        const hash = await hashPassword('correctpassword');
        const result = await verifyPassword('correctpassword', hash);

        expect(result.ok).toBe(true);
        expect(result.needsUpgrade).toBe(false);
      });

      it('should return ok=false for wrong password', async () => {
        const hash = await hashPassword('correctpassword');
        const result = await verifyPassword('wrongpassword', hash);

        expect(result.ok).toBe(false);
        expect(result.needsUpgrade).toBe(false);
      });

      it('should not flag needsUpgrade for bcrypt', async () => {
        const hash = await hashPassword('testpassword');
        const result = await verifyPassword('testpassword', hash);

        expect(result.needsUpgrade).toBe(false);
      });
    });

    describe('with legacy SHA256 hash', () => {
      it('should return ok=true for correct password', async () => {
        const legacyHash = createLegacyHash('legacypassword');
        const result = await verifyPassword('legacypassword', legacyHash);

        expect(result.ok).toBe(true);
      });

      it('should return ok=false for wrong password', async () => {
        const legacyHash = createLegacyHash('legacypassword');
        const result = await verifyPassword('wrongpassword', legacyHash);

        expect(result.ok).toBe(false);
      });

      it('should flag needsUpgrade=true when password is correct', async () => {
        const legacyHash = createLegacyHash('legacypassword');
        const result = await verifyPassword('legacypassword', legacyHash);

        expect(result.ok).toBe(true);
        expect(result.needsUpgrade).toBe(true);
      });

      it('should NOT flag needsUpgrade when password is wrong', async () => {
        const legacyHash = createLegacyHash('legacypassword');
        const result = await verifyPassword('wrongpassword', legacyHash);

        expect(result.ok).toBe(false);
        expect(result.needsUpgrade).toBe(false);
      });
    });

    describe('auto-detection', () => {
      it('should detect bcrypt hash by prefix', async () => {
        const bcryptHash = await hashPassword('test');
        const result = await verifyPassword('test', bcryptHash);

        // bcrypt detected, not flagged for upgrade
        expect(result.needsUpgrade).toBe(false);
      });

      it('should detect SHA256 hash (64 hex chars, no prefix)', async () => {
        const sha256Hash = createLegacyHash('test');

        // SHA256 hash should be 64 hex characters
        expect(sha256Hash).toMatch(/^[a-f0-9]{64}$/);

        const result = await verifyPassword('test', sha256Hash);

        // SHA256 detected, flagged for upgrade
        expect(result.needsUpgrade).toBe(true);
      });
    });
  });

  describe('upgrade flow simulation', () => {
    it('should simulate transparent upgrade on login', async () => {
      // 1. User has legacy SHA256 hash in DB
      const legacyHash = createLegacyHash('userpassword');
      expect(legacyHash).toMatch(/^[a-f0-9]{64}$/);

      // 2. User logs in with correct password
      const result = await verifyPassword('userpassword', legacyHash);
      expect(result.ok).toBe(true);
      expect(result.needsUpgrade).toBe(true);

      // 3. Since needsUpgrade, app calls hashPassword to get new bcrypt hash
      const newHash = await hashPassword('userpassword');
      expect(newHash).toMatch(/^\$2[aby]\$12\$/);

      // 4. New hash is stored, next login uses bcrypt
      const nextLogin = await verifyPassword('userpassword', newHash);
      expect(nextLogin.ok).toBe(true);
      expect(nextLogin.needsUpgrade).toBe(false);
    });

    it('should NOT upgrade on failed login', async () => {
      const legacyHash = createLegacyHash('userpassword');

      // Wrong password attempt
      const result = await verifyPassword('wrongpassword', legacyHash);

      expect(result.ok).toBe(false);
      expect(result.needsUpgrade).toBe(false);

      // Hash should remain unchanged (no upgrade triggered)
    });
  });
});
