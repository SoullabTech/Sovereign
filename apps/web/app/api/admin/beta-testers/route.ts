import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/admin/beta-testers
 * Fetch all beta testers
 */
export async function GET() {
  try {
    const testers = await prisma.betaTester.findMany({
      orderBy: {
        invitedAt: 'desc',
      },
    });

    return NextResponse.json(testers);
  } catch (error) {
    console.error('Failed to fetch beta testers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beta testers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/beta-testers
 * Add a new beta tester
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, notes, accessLevel } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const tester = await prisma.betaTester.create({
      data: {
        name,
        email,
        notes,
        accessLevel: accessLevel || 'standard',
      },
    });

    return NextResponse.json(tester);
  } catch (error: any) {
    console.error('Failed to create beta tester:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create beta tester' },
      { status: 500 }
    );
  }
}
