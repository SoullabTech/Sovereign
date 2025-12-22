/**
 * COMMUNITY COMMONS POSTS LIST ROUTE
 *
 * TEMPORARILY DISABLED during PostgreSQL migration
 * TODO: Refactor to use lib/db/postgres.ts
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Temporarily disabled during PostgreSQL migration." },
    { status: 501 }
  );
}
