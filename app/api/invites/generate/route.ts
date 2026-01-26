import { NextRequest, NextResponse } from 'next/server';
import { sql, getPool } from '@/lib/db/postgres';
import { generateUniquePasskey, createInviteQrData } from '@/lib/qr/inviteQrService';

export async function POST(request: NextRequest) {
  try {
    // Get member ID from header (Capacitor support) or session
    const memberId = request.headers.get('x-member-id');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientName, recipientEmail, blessingText, personalNote } = body;

    // Blessing text is required - it's the ethical gate
    if (!blessingText || blessingText.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please share why you are inviting this person (at least a few words)' },
        { status: 400 }
      );
    }

    // Get the inviter's name
    const pool = getPool();
    const memberResult = await pool.query(
      'SELECT name FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    const inviterName = memberResult.rows[0].name;

    // Generate unique passkey based on recipient name or random
    const baseName = recipientName?.split(' ')[0]?.toUpperCase() || 'FRIEND';
    const passkey = await generateUniquePasskeyFromDb(baseName, pool);

    // Insert invite record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 day expiry

    await pool.query(
      `INSERT INTO invites (
        passkey, status, created_by, intended_name, intended_email,
        blessing_text, personal_note, bead_tier, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        passkey,
        'active',
        memberId,
        recipientName || null,
        recipientEmail || null,
        blessingText.trim(),
        personalNote?.trim() || null,
        'seed', // Starting tier
        expiresAt,
      ]
    );

    // Build the invite URL and QR data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soullab.life';
    const inviteUrl = `${baseUrl}/invite/${passkey}`;

    const qrData = {
      passkey,
      url: inviteUrl,
      recipientName: recipientName || undefined,
      gifterName: inviterName,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      invite: qrData,
    });

  } catch (error) {
    console.error('Error generating invite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate invite' },
      { status: 500 }
    );
  }
}

// Generate unique passkey, checking database for conflicts
async function generateUniquePasskeyFromDb(baseName: string, pool: any): Promise<string> {
  const cleanName = baseName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 10);

  // Try without suffix first
  let passkey = `SOULLAB-${cleanName}`;
  let exists = await passkeyExists(passkey, pool);

  if (!exists) return passkey;

  // Add random suffix
  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    passkey = `SOULLAB-${cleanName}-${suffix}`;
    exists = await passkeyExists(passkey, pool);
    if (!exists) return passkey;
  }

  // Fallback to fully random
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `SOULLAB-${random}`;
}

async function passkeyExists(passkey: string, pool: any): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM invites WHERE passkey = $1 LIMIT 1',
    [passkey]
  );
  return result.rows.length > 0;
}
