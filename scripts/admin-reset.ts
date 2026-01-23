#!/usr/bin/env npx tsx
/**
 * Admin Password Reset & Recovery Tool
 *
 * Usage:
 *   npx tsx scripts/admin-reset.ts reset <username|email> [newPassword]
 *   npx tsx scripts/admin-reset.ts magic <email>
 *   npx tsx scripts/admin-reset.ts info <username|email>
 *
 * Examples:
 *   npx tsx scripts/admin-reset.ts reset kelly Mandala21
 *   npx tsx scripts/admin-reset.ts magic kelly@soullab.life
 *   npx tsx scripts/admin-reset.ts info kelly
 */

import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness';
const BASE_URL = process.env.NEXTAUTH_URL || process.env.BASE_URL || 'https://soullab.life';

const pool = new Pool({ connectionString: DATABASE_URL });

async function findMember(identifier: string) {
  const result = await pool.query(
    `SELECT id, username, email, name, tier, onboarded, last_sign_in, created_at
     FROM members
     WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)`,
    [identifier]
  );
  return result.rows[0] || null;
}

async function resetPassword(identifier: string, newPassword?: string) {
  const member = await findMember(identifier);
  if (!member) {
    console.error(`\n❌ No member found with username/email: ${identifier}\n`);
    process.exit(1);
  }

  const password = newPassword || generateTempPassword();
  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    'UPDATE members SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [hash, member.id]
  );

  console.log('\n✅ Password reset successful!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Username: ${member.username}`);
  console.log(`  Email:    ${member.email}`);
  console.log(`  Password: ${password}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Copy-paste for tester:\n');
  console.log(`Your Soullab password has been reset.`);
  console.log(`Sign in at: ${BASE_URL}/signin`);
  console.log(`Username: ${member.username}`);
  console.log(`Password: ${password}`);
  console.log(`\n(Please change your password after signing in)\n`);
}

async function generateMagicLink(identifier: string) {
  const member = await findMember(identifier);
  if (!member) {
    console.error(`\n❌ No member found with username/email: ${identifier}\n`);
    process.exit(1);
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Invalidate existing tokens
  await pool.query(
    'UPDATE magic_link_tokens SET used = true WHERE email = $1 AND used = false',
    [member.email]
  );

  // Create new token
  await pool.query(
    'INSERT INTO magic_link_tokens (email, member_id, token, expires_at) VALUES ($1, $2, $3, $4)',
    [member.email, member.id, token, expiresAt]
  );

  const magicLink = `${BASE_URL}/api/members/magic-link?token=${token}`;

  console.log('\n✅ Magic link generated!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Username: ${member.username}`);
  console.log(`  Email:    ${member.email}`);
  console.log(`  Expires:  15 minutes`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Copy-paste for tester:\n');
  console.log(`Here's your one-time sign-in link (expires in 15 minutes):`);
  console.log(`${magicLink}\n`);
}

async function showInfo(identifier: string) {
  const member = await findMember(identifier);
  if (!member) {
    console.error(`\n❌ No member found with username/email: ${identifier}\n`);
    process.exit(1);
  }

  console.log('\n📋 Member Info\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ID:         ${member.id}`);
  console.log(`  Username:   ${member.username}`);
  console.log(`  Email:      ${member.email}`);
  console.log(`  Name:       ${member.name}`);
  console.log(`  Tier:       ${member.tier || 'free'}`);
  console.log(`  Onboarded:  ${member.onboarded ? 'Yes' : 'No'}`);
  console.log(`  Last login: ${member.last_sign_in || 'Never'}`);
  console.log(`  Created:    ${member.created_at}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

function generateTempPassword(): string {
  const words = ['Jade', 'Soul', 'Flow', 'Mind', 'Star', 'Wave', 'Light', 'Calm'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${word}${num}`;
}

function showUsage() {
  console.log(`
Admin Password Reset & Recovery Tool

Usage:
  npx tsx scripts/admin-reset.ts <command> <identifier> [options]

Commands:
  reset <username|email> [password]  Reset password (generates temp if not provided)
  magic <username|email>             Generate a 15-minute magic link
  info  <username|email>             Show member info

Examples:
  npx tsx scripts/admin-reset.ts reset kelly Mandala21
  npx tsx scripts/admin-reset.ts reset kelly@example.com
  npx tsx scripts/admin-reset.ts magic kelly
  npx tsx scripts/admin-reset.ts info kelly
`);
}

async function main() {
  const [,, command, identifier, ...args] = process.argv;

  if (!command || !identifier) {
    showUsage();
    process.exit(1);
  }

  try {
    switch (command) {
      case 'reset':
        await resetPassword(identifier, args[0]);
        break;
      case 'magic':
        await generateMagicLink(identifier);
        break;
      case 'info':
        await showInfo(identifier);
        break;
      default:
        console.error(`\n❌ Unknown command: ${command}`);
        showUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
