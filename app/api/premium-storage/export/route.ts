import { NextRequest, NextResponse } from 'next/server';
import { PremiumStorageService } from '@/lib/services/premium-storage';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, exportType } = body;

    if (!userId || !exportType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, exportType' },
        { status: 400 }
      );
    }

    const validExportTypes = ['full', 'conversations', 'journey_maps', 'analysis'];
    if (!validExportTypes.includes(exportType)) {
      return NextResponse.json(
        {
          error: `Invalid export type. Must be one of: ${validExportTypes.join(', ')}`,
          valid_types: validExportTypes
        },
        { status: 400 }
      );
    }

    const storageService = PremiumStorageService.getInstance();
    const archivePath = await storageService.createExportArchive(userId, exportType);

    return NextResponse.json({
      success: true,
      archivePath,
      exportType,
      message: 'Export archive created successfully',
      download_info: {
        note: 'Archive created on local server. In production, this would provide a secure download link.'
      }
    });

  } catch (error) {
    console.error('Error creating export archive:', error);

    if (error instanceof Error) {
      if (error.message.includes('Premium storage not initialized')) {
        return NextResponse.json(
          {
            error: 'Premium storage not initialized for user',
            code: 'STORAGE_NOT_INITIALIZED'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create export archive' },
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

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const exports = await prisma.exportArchive.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        exportType: true,
        fileName: true,
        fileSizeBytes: true,
        isEncrypted: true,
        compressionRatio: true,
        exportMetadata: true,
        createdAt: true,
      },
    });

    const total = await prisma.exportArchive.count({
      where: { userId },
    });

    // Calculate total storage used by exports
    const totalStorageBytes = exports.reduce((sum, exp) => sum + (exp.fileSizeBytes || 0), 0);
    const totalStorageGB = totalStorageBytes / (1024 * 1024 * 1024);

    return NextResponse.json({
      success: true,
      exports,
      storage_summary: {
        total_exports: total,
        total_storage_bytes: totalStorageBytes,
        total_storage_gb: parseFloat(totalStorageGB.toFixed(3)),
        average_file_size_mb: exports.length > 0 ?
          parseFloat(((totalStorageBytes / exports.length) / (1024 * 1024)).toFixed(2)) : 0,
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error retrieving export archives:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve export archives' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exportId = searchParams.get('exportId');

    if (!exportId) {
      return NextResponse.json(
        { error: 'Missing exportId parameter' },
        { status: 400 }
      );
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Get export record
    const exportRecord = await prisma.exportArchive.findUnique({
      where: { id: exportId },
    });

    if (!exportRecord) {
      return NextResponse.json(
        { error: 'Export archive not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    const fs = require('fs/promises');
    try {
      await fs.unlink(exportRecord.filePath);
    } catch (fileError) {
      console.warn(`Failed to delete file ${exportRecord.filePath}:`, fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete database record
    await prisma.exportArchive.delete({
      where: { id: exportId },
    });

    return NextResponse.json({
      success: true,
      message: 'Export archive deleted successfully',
      deleted_export: {
        id: exportRecord.id,
        fileName: exportRecord.fileName,
        exportType: exportRecord.exportType,
      },
    });

  } catch (error) {
    console.error('Error deleting export archive:', error);
    return NextResponse.json(
      { error: 'Failed to delete export archive' },
      { status: 500 }
    );
  }
}