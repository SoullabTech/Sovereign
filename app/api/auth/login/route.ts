import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import bcrypt from 'bcryptjs';

/**
 * Authentication Login API
 * Validates credentials against PostgreSQL database with bcrypt
 */

interface LoginRequest {
  username: string;
  password: string;
}

interface Member {
  id: string;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  passkey: string;
  onboarded: boolean;
  created_at: string;
  tier: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Normalize username for case-insensitive lookup
    const normalizedUsername = username.toLowerCase();

    // Query database for member by username, email, or passkey
    const result = await query<Member>(
      `SELECT id, username, name, email, password_hash, passkey, onboarded, created_at, tier
       FROM members
       WHERE LOWER(username) = $1 OR LOWER(email) = $1 OR UPPER(passkey) = UPPER($1)
       LIMIT 1`,
      [normalizedUsername]
    );

    if (result.rows.length === 0) {
      console.log('Login attempt failed - user not found:', normalizedUsername);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const member = result.rows[0];

    // Check if password matches passkey (SOULLAB-NAME format) OR bcrypt hash
    const isPasskeyMatch = member.passkey && password.toUpperCase() === member.passkey.toUpperCase();
    const isBcryptMatch = member.password_hash && await bcrypt.compare(password, member.password_hash);

    if (!isPasskeyMatch && !isBcryptMatch) {
      console.log('Login attempt failed - invalid password for:', normalizedUsername);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Update last sign in
    await query(
      `UPDATE members SET last_sign_in = NOW() WHERE id = $1`,
      [member.id]
    );

    // Return user data (without password hash)
    const userData = {
      id: member.id,
      username: member.username,
      name: member.name,
      email: member.email,
      onboarded: member.onboarded,
      createdAt: member.created_at,
      tier: member.tier,
    };

    console.log('Login successful for:', member.username);

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Welcome back'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to login.' },
    { status: 405 }
  );
}
