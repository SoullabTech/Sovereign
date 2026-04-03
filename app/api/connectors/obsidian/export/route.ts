/**
 * OBSIDIAN EXPORT
 *
 * Export content (session summary, journal entry, reflection, etc.)
 * as a markdown file to the member's configured Obsidian vault.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getConnector, touchLastUsed, upsertConnector } from '@/lib/connectors/connectorDb';
import { exportToObsidian } from '@/lib/connectors/obsidian/obsidianExport';
import type { ObsidianConfig } from '@/lib/connectors/obsidian/types';
import type { ObsidianExportPayload } from '@/lib/connectors/obsidian/types';

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in mobile build' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { userId, ...payload } = body as { userId: string } & ObsidianExportPayload;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (!payload.type || !payload.title) {
      return NextResponse.json({ error: 'type and title are required' }, { status: 400 });
    }

    const connector = await getConnector(userId, 'obsidian');
    if (!connector || connector.status !== 'connected') {
      return NextResponse.json(
        { error: 'Obsidian is not configured. Set up your vault path first.' },
        { status: 400 }
      );
    }

    const config = connector.config as unknown as ObsidianConfig;
    const { filePath, fileName } = await exportToObsidian(config, payload);

    touchLastUsed(userId, 'obsidian');

    // Update metadata with export count
    const currentMeta = connector.metadata as Record<string, unknown>;
    const exportCount = ((currentMeta.exportCount as number) ?? 0) + 1;
    upsertConnector(userId, 'obsidian', {
      connectorClass: 'local',
      metadata: { ...currentMeta, exportCount, lastExportFile: fileName },
    }).catch(() => {}); // fire-and-forget

    return NextResponse.json({
      success: true,
      fileName,
      filePath,
    });
  } catch (err: any) {
    console.error('[Obsidian] export error:', err.message);
    return NextResponse.json({ error: `Export failed: ${err.message}` }, { status: 500 });
  }
}
