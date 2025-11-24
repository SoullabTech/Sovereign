import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { ObsidianVaultBridge } from '../../../../../../lib/bridges/obsidian-vault-bridge';

export async function POST(request: NextRequest) {
  try {
    // Initialize vault bridge
    const vaultBridge = new ObsidianVaultBridge();

    // Connect to vault
    await vaultBridge.connect();

    // Get current stats
    const frameworks = await vaultBridge.getFrameworks();
    const concepts = await vaultBridge.getConcepts();
    const practices = await vaultBridge.getPractices();
    const integrations = await vaultBridge.getIntegrations();
    const books = await vaultBridge.getBookContent();

    const stats = {
      totalNotes: frameworks.length + concepts.length + practices.length + integrations.length + books.length,
      frameworks: frameworks.length,
      concepts: concepts.length,
      practices: practices.length,
      books: books.length,
      integrations: integrations.length,
      lastConnected: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Connected to Obsidian vault successfully',
      stats
    });

  } catch (error) {
    console.error('Vault connection failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to vault'
    }, { status: 500 });
  }
}