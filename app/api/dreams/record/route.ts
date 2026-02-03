// @ts-nocheck - Prototype file, not type-checked
// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
=======

export const revalidate = false;
import { PrismaClient } from '@prisma/client';
import { betaSession } from '@/lib/auth/betaSession';
import { DreamWeaverEngine } from '@/app/api/_backend/src/oracle/core/DreamWeaverEngine';
import { DreamMemorySchema } from '@/app/api/_backend/src/schemas/dreamMemory.schema';

// Skip during static export (Capacitor builds)
>>>>>>> ecstatic-brown

/**
 * Dream Recording API - Temporarily unavailable
 * DreamWeaver Engine is being migrated from legacy backend
 */

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Dream recording temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}

export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to record dreams.' },
    { status: 405 }
  );
}
