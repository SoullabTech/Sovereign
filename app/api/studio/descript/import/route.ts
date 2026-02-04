import { NextRequest, NextResponse } from 'next/server';
import { getDescriptClient } from '@/lib/descript/client';
import { sql } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

/**
 * POST /api/studio/descript/import
 * Create a Descript import URL for a recording
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, fileUrl, fileName, mimeType } = body;

    if (!projectName || !fileUrl) {
      return NextResponse.json(
        { error: 'projectName and fileUrl are required' },
        { status: 400 }
      );
    }

    // Get Descript API token from settings
    const settings = await sql`
      SELECT value FROM studio_settings WHERE key = 'descript_api_token'
    `;

    if (settings.length === 0 || !settings[0].value) {
      return NextResponse.json(
        { error: 'Descript API token not configured. Go to Settings to add it.' },
        { status: 400 }
      );
    }

    const client = getDescriptClient(settings[0].value);

    // Create import URL
    const result = await client.createImportUrl({
      name: projectName,
      files: [{
        uri: fileUrl,
        name: fileName || projectName,
        mimeType: mimeType || 'video/webm',
      }],
    });

    // Store project reference locally
    await sql`
      INSERT INTO studio_media_projects (
        name,
        source,
        status,
        descript_import_url,
        source_file_url,
        created_at
      ) VALUES (
        ${projectName},
        'descript',
        'importing',
        ${result.import_url},
        ${fileUrl},
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      importUrl: result.import_url,
      expiresAt: result.expires_at,
    });
  } catch (error) {
    console.error('Descript import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
