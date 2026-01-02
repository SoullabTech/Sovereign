// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { CloudBackupService } from '@/lib/services/cloud-backup';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, backupType, config } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const validBackupTypes = ['full', 'incremental', 'consciousness_only'];
    if (backupType && !validBackupTypes.includes(backupType)) {
      return NextResponse.json(
        {
          error: `Invalid backup type. Must be one of: ${validBackupTypes.join(', ')}`,
          valid_types: validBackupTypes
        },
        { status: 400 }
      );
    }

    const backupService = CloudBackupService.getInstance();
    const backup = await backupService.createBackup(
      userId,
      backupType || 'full',
      config
    );

    return NextResponse.json({
      success: true,
      backup,
      message: 'Backup created successfully'
    });

  } catch (error) {
    console.error('Error creating backup:', error);

    if (error instanceof Error) {
      if (error.message.includes('Cloud backup not enabled')) {
        return NextResponse.json(
          {
            error: 'Cloud backup not enabled for user',
            code: 'BACKUP_NOT_ENABLED'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const backupService = CloudBackupService.getInstance();
    const result = await backupService.listUserBackups(userId, limit, offset);

    // Calculate backup storage summary
    const totalOriginalBytes = result.backups.reduce(
      (sum, backup) => sum + (backup.originalSizeBytes || 0), 0
    );
    const totalCompressedBytes = result.backups.reduce(
      (sum, backup) => sum + (backup.compressedSizeBytes || 0), 0
    );

    const storageSummary = {
      total_backups: result.total,
      total_original_bytes: totalOriginalBytes,
      total_compressed_bytes: totalCompressedBytes,
      total_original_gb: parseFloat((totalOriginalBytes / (1024 * 1024 * 1024)).toFixed(3)),
      total_compressed_gb: parseFloat((totalCompressedBytes / (1024 * 1024 * 1024)).toFixed(3)),
      average_compression_ratio: result.backups.length > 0 ?
        parseFloat((result.backups.reduce((sum, b) => sum + (b.compressionRatio || 1), 0) / result.backups.length).toFixed(2)) :
        1.0,
      space_saved_gb: parseFloat(((totalOriginalBytes - totalCompressedBytes) / (1024 * 1024 * 1024)).toFixed(3)),
    };

    return NextResponse.json({
      success: true,
      ...result,
      storage_summary: storageSummary,
    });

  } catch (error) {
    console.error('Error retrieving backups:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve backups' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action'); // 'cleanup' or specific backup ID

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const backupService = CloudBackupService.getInstance();

    if (action === 'cleanup') {
      // Cleanup old backups based on retention policy
      const deletedCount = await backupService.cleanupOldBackups(userId);

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${deletedCount} old backups`,
        deleted_count: deletedCount,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use action=cleanup or provide specific backup ID' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error managing backups:', error);
    return NextResponse.json(
      { error: 'Failed to manage backups' },
      { status: 500 }
    );
  }
}