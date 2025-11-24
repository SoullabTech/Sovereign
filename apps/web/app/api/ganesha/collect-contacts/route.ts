/**
 * Ganesha Contact Collection API
 * Comprehensive search across all possible data sources for beta testers
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const contactSources: any = {
      sources: [
        {
          name: 'Supabase Beta Signups',
          status: 'checking',
          data: [],
          error: null
        },
        {
          name: 'File System Search',
          status: 'checking',
          data: [],
          error: null
        },
        {
          name: 'Static Beta Testers',
          status: 'checking',
          data: [],
          error: null
        }
      ],
      totalFound: 0,
      consolidatedList: [],
      instructions: []
    };

    // Check Supabase (if configured)
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();

      const { data: supabaseData, error: supabaseError } = await supabase
        .from('beta_signups')
        .select('*')
        .order('created_at', { ascending: true });

      if (supabaseError) {
        contactSources.sources[0].status = 'error';
        contactSources.sources[0].error = supabaseError.message;
      } else {
        contactSources.sources[0].status = 'success';
        contactSources.sources[0].data = supabaseData || [];
      }
    } catch (error) {
      contactSources.sources[0].status = 'error';
      contactSources.sources[0].error = 'Supabase not configured or accessible';
    }

    // Check static beta testers file
    try {
      const { betaTesters } = await import('@/lib/data/betaTesters');
      contactSources.sources[2].status = 'success';
      contactSources.sources[2].data = betaTesters || [];
    } catch (error) {
      contactSources.sources[2].status = 'error';
      contactSources.sources[2].error = 'Beta testers file not found';
    }

    // File system search for potential contact files
    try {
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');

      const searchPaths = [
        '/Users/soullab/MAIA-FRESH',
        '/Users/soullab/MAIA-FRESH/apps/web',
        process.cwd()
      ];

      let foundFiles: string[] = [];

      for (const searchPath of searchPaths) {
        try {
          const files = await fs.readdir(searchPath, { withFileTypes: true });
          const contactFiles = files
            .filter(file => {
              const name = file.name.toLowerCase();
              return (
                (name.includes('beta') || name.includes('contact') || name.includes('email')) &&
                (name.endsWith('.csv') || name.endsWith('.json') || name.endsWith('.txt'))
              );
            })
            .map(file => path.join(searchPath, file.name));

          foundFiles = foundFiles.concat(contactFiles);
        } catch (err) {
          // Directory doesn't exist or no access, continue
        }
      }

      contactSources.sources[1].status = 'success';
      contactSources.sources[1].data = foundFiles;
    } catch (error) {
      contactSources.sources[1].status = 'error';
      contactSources.sources[1].error = 'File system search failed';
    }

    // Calculate totals and create instructions
    const supabaseCount = contactSources.sources[0].data.length || 0;
    const staticCount = contactSources.sources[2].data.length || 0;
    const fileCount = contactSources.sources[1].data.length || 0;

    contactSources.totalFound = supabaseCount + staticCount;

    // Create instructions based on what we found
    if (supabaseCount > 0) {
      contactSources.instructions.push(
        `✅ Found ${supabaseCount} contacts in Supabase - use the Supabase export tool`
      );
    }

    if (staticCount > 0) {
      contactSources.instructions.push(
        `✅ Found ${staticCount} contacts in static file - these are ready to use`
      );
    }

    if (fileCount > 0) {
      contactSources.instructions.push(
        `📁 Found ${fileCount} potential contact files - check these manually`
      );
    }

    if (contactSources.totalFound === 0) {
      contactSources.instructions.push(
        "🔍 No contacts found in automatic sources",
        "📝 Use the manual import tool at /ganesha-import to add your 50+ beta testers",
        "💡 You can paste from any source: spreadsheets, email lists, text files, etc."
      );
    }

    // Create consolidated list for easy import
    const consolidated: any[] = [];

    // Add Supabase contacts
    if (contactSources.sources[0].data.length > 0) {
      contactSources.sources[0].data.forEach((contact: any, index: number) => {
        consolidated.push({
          source: 'supabase',
          name: `${contact.first_name} ${contact.last_name}`.trim(),
          email: contact.email,
          joinDate: contact.created_at?.split('T')[0] || '2024-01-01',
          metadata: {
            city: contact.city,
            preferredElement: contact.preferred_element,
            status: contact.status
          }
        });
      });
    }

    // Add static file contacts
    if (contactSources.sources[2].data.length > 0) {
      contactSources.sources[2].data.forEach((contact: any) => {
        if (contact.status === 'active') {
          consolidated.push({
            source: 'static',
            name: contact.name,
            email: contact.email,
            joinDate: contact.joinDate || '2024-01-01',
            metadata: {
              contribution: contact.contribution,
              tags: contact.tags
            }
          });
        }
      });
    }

    contactSources.consolidatedList = consolidated;
    contactSources.totalFound = consolidated.length;

    return NextResponse.json({
      message: '🧠 Ganesha Contact Collection Complete',
      ...contactSources,
      quickActions: {
        manualImport: '/ganesha-import',
        exportAPI: '/api/ganesha/export-contacts',
        testEmail: '/test-ganesha-email'
      }
    });

  } catch (error) {
    console.error('Contact collection error:', error);

    return NextResponse.json({
      error: 'Collection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallbackInstructions: [
        '📝 Use manual import at /ganesha-import',
        '🔍 Check your email archives, spreadsheets, or contact lists',
        '📋 Paste any format: the tool will auto-detect names and emails',
        '🚀 Generated code can be copied directly into contacts.ts'
      ]
    }, { status: 500 });
  }
}