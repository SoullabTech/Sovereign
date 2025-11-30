import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { headers } from 'next/headers';

/**
 * MAIA Compact Companion Download API
 * Provides secure downloads for authenticated members
 */

interface DownloadMapping {
  [key: string]: {
    filename: string;
    contentType: string;
    size: number;
  };
}

const downloadMappings: DownloadMapping = {
  'mac-arm': {
    filename: 'MAIA-Compact-Companion-1.0.0-arm64-mac.zip',
    contentType: 'application/zip',
    size: 47185920 // ~45 MB
  },
  'mac-intel': {
    filename: 'MAIA-Compact-Companion-1.0.0-mac.zip',
    contentType: 'application/zip',
    size: 50331648 // ~48 MB
  },
  'windows': {
    filename: 'MAIA-Compact-Companion-1.0.0-win.exe',
    contentType: 'application/octet-stream',
    size: 52428800 // ~50 MB
  },
  'linux': {
    filename: 'MAIA-Compact-Companion-1.0.0-linux.AppImage',
    contentType: 'application/octet-stream',
    size: 54525952 // ~52 MB
  }
};

async function validateMemberAccess(request: NextRequest): Promise<boolean> {
  // In a real implementation, this would check:
  // 1. Valid session token
  // 2. Member subscription status
  // 3. Download permissions

  const authHeader = request.headers.get('authorization');
  const sessionCookie = request.cookies.get('session');

  // For demo purposes, allow if any auth is present
  return !!(authHeader || sessionCookie);
}

async function logDownload(platform: string, userAgent: string, ip: string) {
  // Log download for analytics
  const logEntry = {
    timestamp: new Date().toISOString(),
    platform,
    userAgent,
    ip: ip.replace(/\d+$/, 'xxx'), // Anonymize IP
    app: 'compact-companion'
  };

  console.log('Download logged:', logEntry);
  // In production, would write to database or analytics service
}

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const platform = params.platform;
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] || 'unknown';

    // Validate platform
    if (!downloadMappings[platform]) {
      return NextResponse.json(
        { error: 'Platform not supported' },
        { status: 400 }
      );
    }

    // Validate member access
    const hasAccess = await validateMemberAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const downloadInfo = downloadMappings[platform];

    // For demo purposes, return download info instead of actual file
    // In production, this would serve the actual file from storage
    const response = {
      success: true,
      platform,
      filename: downloadInfo.filename,
      size: downloadInfo.size,
      contentType: downloadInfo.contentType,
      downloadUrl: `/downloads/files/${downloadInfo.filename}`,
      message: 'Download ready',
      version: '1.0.0'
    };

    // Log the download
    await logDownload(platform, userAgent, ip);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache',
        'X-Download-Platform': platform,
        'X-Download-Version': '1.0.0'
      }
    });

  } catch (error) {
    console.error('Download API error:', error);

    return NextResponse.json(
      { error: 'Download service temporarily unavailable' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}