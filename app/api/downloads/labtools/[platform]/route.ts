import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { headers } from 'next/headers';

// Generate static params for all supported platforms
export async function generateStaticParams() {
  return [
    { platform: 'mac-arm' },
    { platform: 'mac-intel' },
    { platform: 'windows' },
    { platform: 'linux' }
  ];
}

/**
 * MAIA LabTools + IPP Download API
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
    filename: 'MAIA LabTools + IPP-0.1.0-arm64-mac.zip',
    contentType: 'application/zip',
    size: 125829120 // ~120 MB
  },
  'mac-intel': {
    filename: 'MAIA LabTools + IPP-0.1.0-mac.zip',
    contentType: 'application/zip',
    size: 131072000 // ~125 MB
  },
  'windows': {
    filename: 'MAIA LabTools + IPP-0.1.0-win.exe',
    contentType: 'application/octet-stream',
    size: 140000000 // ~133 MB
  },
  'linux': {
    filename: 'MAIA LabTools + IPP-0.1.0-linux.AppImage',
    contentType: 'application/octet-stream',
    size: 145000000 // ~138 MB
  }
};

async function validateMemberAccess(request: NextRequest): Promise<{ hasAccess: boolean; role?: string }> {
  // In a real implementation, this would check:
  // 1. Valid session token
  // 2. Member subscription status
  // 3. Download permissions
  // 4. Professional credentials for LabTools

  const authHeader = request.headers.get('authorization');
  const sessionCookie = request.cookies.get('session');

  // For demo purposes, allow if any auth is present
  const hasAccess = !!(authHeader || sessionCookie);

  return {
    hasAccess,
    role: hasAccess ? 'licensed_professional' : undefined
  };
}

async function logDownload(platform: string, userAgent: string, ip: string, role: string) {
  // Log download for analytics and compliance
  const logEntry = {
    timestamp: new Date().toISOString(),
    platform,
    userAgent,
    ip: ip.replace(/\d+$/, 'xxx'), // Anonymize IP
    app: 'labtools-ipp',
    userRole: role
  };

  console.log('LabTools download logged:', logEntry);
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

    // Validate member access and professional credentials
    const { hasAccess, role } = await validateMemberAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'LabTools requires professional membership or credentials'
        },
        { status: 401 }
      );
    }

    const downloadInfo = downloadMappings[platform];

    // Return download information
    const response = {
      success: true,
      platform,
      filename: downloadInfo.filename,
      size: downloadInfo.size,
      contentType: downloadInfo.contentType,
      downloadUrl: `/downloads/files/${downloadInfo.filename}`,
      message: 'LabTools download ready',
      version: '0.1.0',
      features: [
        'EEG/biometric monitoring',
        'IPP clinical assessment',
        'Guardian protocol safety',
        'Real-time consciousness mapping',
        'Professional documentation tools'
      ],
      requirements: {
        professional_license: true,
        minimum_ram: '8GB',
        operating_system: platform.includes('mac') ? 'macOS 11.0+' : platform === 'windows' ? 'Windows 10+' : 'Ubuntu 20.04+'
      }
    };

    // Log the download
    await logDownload(platform, userAgent, ip, role || 'unknown');

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache',
        'X-Download-Platform': platform,
        'X-Download-Version': '0.1.0',
        'X-Professional-Tool': 'true'
      }
    });

  } catch (error) {
    console.error('LabTools Download API error:', error);

    return NextResponse.json(
      { error: 'LabTools download service temporarily unavailable' },
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