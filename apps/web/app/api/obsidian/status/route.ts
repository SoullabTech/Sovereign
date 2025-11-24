import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Check if vault config exists
    const configPath = path.join(process.cwd(), '../../config/vault-config.json');

    if (!fs.existsSync(configPath)) {
      return NextResponse.json({
        success: false,
        error: 'Vault not configured'
      });
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Check if vault path exists
    if (!fs.existsSync(config.vaultPath)) {
      return NextResponse.json({
        success: false,
        error: 'Vault path not found'
      });
    }

    return NextResponse.json({
      success: true,
      connected: true,
      stats: {
        totalNotes: config.totalNotes || 0,
        frameworks: config.frameworks || 0,
        concepts: config.concepts || 0,
        practices: config.practices || 0,
        books: config.books || 0,
        integrations: config.integrations || 0,
        lastConnected: config.lastConnected || new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Vault status check failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check vault status'
    }, { status: 500 });
  }
}