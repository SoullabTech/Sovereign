/**
 * OBSIDIAN CONNECTOR CONFIGURE
 *
 * POST: Save vault path and export preferences.
 * Validates the path exists and is writable before saving.
 *
 * DELETE: Disconnect the Obsidian connector.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { upsertConnector, deleteConnector } from '@/lib/connectors/connectorDb';
import { validateVaultPath } from '@/lib/connectors/obsidian/obsidianExport';
import { DEFAULT_OBSIDIAN_CONFIG } from '@/lib/connectors/obsidian/types';
import type { ObsidianConfig } from '@/lib/connectors/obsidian/types';

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in mobile build' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { userId, vaultPath, exportFolder, autoExport, exportTypes } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (!vaultPath) {
      return NextResponse.json({ error: 'vaultPath is required' }, { status: 400 });
    }

    const folder = exportFolder || DEFAULT_OBSIDIAN_CONFIG.exportFolder;

    // Validate the vault path
    const validation = await validateVaultPath(vaultPath, folder);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, valid: false },
        { status: 400 }
      );
    }

    const config: ObsidianConfig = {
      vaultPath,
      exportFolder: folder,
      autoExport: autoExport ?? DEFAULT_OBSIDIAN_CONFIG.autoExport,
      exportTypes: exportTypes ?? DEFAULT_OBSIDIAN_CONFIG.exportTypes,
      includeFrontmatter: DEFAULT_OBSIDIAN_CONFIG.includeFrontmatter,
      includeTranscript: DEFAULT_OBSIDIAN_CONFIG.includeTranscript,
    };

    const connector = await upsertConnector(userId, 'obsidian', {
      connectorClass: 'local',
      status: 'connected',
      displayName: 'Obsidian Vault',
      capabilities: ['export_markdown', 'export_transcript'],
      config: config as unknown as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      connector,
    });
  } catch (err: any) {
    console.error('[Obsidian] configure error:', err.message);
    return NextResponse.json({ error: 'Failed to configure Obsidian' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in mobile build' }, { status: 400 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await deleteConnector(userId, 'obsidian');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Obsidian] disconnect error:', err.message);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
