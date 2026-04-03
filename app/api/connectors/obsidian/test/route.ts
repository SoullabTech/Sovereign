/**
 * OBSIDIAN TEST CONNECTION
 *
 * Writes a test markdown file to the configured vault to verify the path works.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getConnector, touchLastUsed } from '@/lib/connectors/connectorDb';
import { writeTestFile } from '@/lib/connectors/obsidian/obsidianExport';
import type { ObsidianConfig } from '@/lib/connectors/obsidian/types';

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in mobile build' }, { status: 400 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const connector = await getConnector(userId, 'obsidian');
    if (!connector || connector.status !== 'connected') {
      return NextResponse.json(
        { error: 'Obsidian is not configured. Set up your vault path first.' },
        { status: 400 }
      );
    }

    const config = connector.config as unknown as ObsidianConfig;
    const { filePath, fileName } = await writeTestFile(config);

    touchLastUsed(userId, 'obsidian');

    return NextResponse.json({
      success: true,
      fileName,
      filePath,
      message: `Test file written to ${filePath}`,
    });
  } catch (err: any) {
    console.error('[Obsidian] test error:', err.message);
    return NextResponse.json({ error: `Test failed: ${err.message}` }, { status: 500 });
  }
}
