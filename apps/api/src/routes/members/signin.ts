/**
 * Sign In Endpoint
 *
 * Validates username/password and returns member data.
 */

import { Request, Response } from 'express';
import { query } from '../../db/postgres.js';
import { hashPassword } from '../../middleware/auth.js';
import { Errors } from '../../middleware/error.js';

export async function signin(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    throw Errors.badRequest('Username and password required');
  }

  // Find member by username (case-insensitive)
  const result = await query(
    'SELECT id, passkey, username, password_hash, name, preferred_name, onboarded, onboarding_step FROM members WHERE LOWER(username) = LOWER($1)',
    [username]
  );

  if (result.rows.length === 0) {
    // Log failed attempt (could add to audit log later)
    console.log(`[MEMBERS] Sign in failed: user not found (${username})`);
    throw Errors.unauthorized('Invalid username or password');
  }

  const member = result.rows[0];

  // Verify password
  const passwordHash = hashPassword(password);
  if (passwordHash !== member.password_hash) {
    console.log(`[MEMBERS] Sign in failed: wrong password (${username})`);
    throw Errors.unauthorized('Invalid username or password');
  }

  // Update last sign in
  await query(
    'UPDATE members SET last_sign_in = NOW() WHERE id = $1',
    [member.id]
  );

  console.log(`[MEMBERS] Sign in successful: ${member.username}`);

  return res.json({
    success: true,
    data: {
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.preferred_name || member.name,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step
      }
    }
  });
}
