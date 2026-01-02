import { NextRequest, NextResponse } from 'next/server';
import { CloudBackupService } from '@/lib/services/cloud-backup';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, backupId, encryptionKey, dryRun = false } = body;

    if (!userId || !backupId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, backupId' },
        { status: 400 }
      );
    }

    const backupService = CloudBackupService.getInstance();

    if (dryRun) {
      // Dry run: just validate the backup without actually restoring
      try {
        await backupService.restoreBackup(userId, backupId, encryptionKey);
        return NextResponse.json({
          success: true,
          dry_run: true,
          message: 'Backup validation successful - ready for restore',
          validation: {
            backup_accessible: true,
            encryption_key_valid: !!encryptionKey,
            integrity_check_passed: true,
          }
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          dry_run: true,
          message: 'Backup validation failed',
          validation: {
            backup_accessible: false,
            encryption_key_valid: false,
            integrity_check_passed: false,
          },
          error: error instanceof Error ? error.message : 'Unknown validation error'
        });
      }
    }

    // Actual restore operation
    const restoredData = await backupService.restoreBackup(userId, backupId, encryptionKey);

    // Analyze restored data
    const dataAnalysis = {
      conversations_count: restoredData.conversations?.length || 0,
      journey_maps_count: restoredData.journeyMaps?.length || 0,
      exports_count: restoredData.exports?.length || 0,
      backup_type: restoredData.backupType,
      backup_timestamp: restoredData.timestamp,
      data_types_included: Object.keys(restoredData).filter(key =>
        !['userId', 'backupType', 'timestamp'].includes(key)
      ),
    };

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      data_analysis: dataAnalysis,
      restored_data: {
        // Only return metadata, not the full data for security
        backup_id: backupId,
        user_id: restoredData.userId,
        backup_type: restoredData.backupType,
        timestamp: restoredData.timestamp,
        data_summary: dataAnalysis,
      },
      next_steps: [
        'Review restored data in your consciousness journey',
        'Verify that all expected conversations and insights are present',
        'Consider creating a new backup of the current state'
      ]
    });

  } catch (error) {
    console.error('Error restoring backup:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            error: 'Backup not found or access denied',
            code: 'BACKUP_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      if (error.message.includes('Encryption key required')) {
        return NextResponse.json(
          {
            error: 'Encryption key required for encrypted backup',
            code: 'ENCRYPTION_KEY_REQUIRED'
          },
          { status: 400 }
        );
      }

      if (error.message.includes('integrity check failed')) {
        return NextResponse.json(
          {
            error: 'Backup integrity check failed - data may be corrupted',
            code: 'BACKUP_CORRUPTED'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}