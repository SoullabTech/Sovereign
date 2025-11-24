/**
 * Ganesha Contact Export API
 * Export and organize your 50+ consciousness pioneers from Supabase
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import {
  exportBetaTestersFromSupabase,
  generateGaneshaContactsFromSupabase,
  generateContactsCode,
  getExportStats
} from '@/lib/ganesha/supabase-export';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats': {
        // Get export statistics
        const stats = await getExportStats();

        return NextResponse.json({
          message: '🧠 Ganesha Contact Export Statistics',
          stats,
          actions: {
            viewContacts: '/api/ganesha/export-contacts?action=contacts',
            generateCode: '/api/ganesha/export-contacts?action=generate-code',
            exportRaw: '/api/ganesha/export-contacts?action=export-raw'
          }
        });
      }

      case 'contacts': {
        // Get converted Ganesha contacts
        const contacts = await generateGaneshaContactsFromSupabase();

        return NextResponse.json({
          message: `🚀 Generated ${contacts.length} Ganesha contacts from Supabase`,
          contacts,
          totalContacts: contacts.length,
          next: 'Use action=generate-code to get TypeScript code for contacts.ts'
        });
      }

      case 'generate-code': {
        // Generate TypeScript code for contacts.ts
        const contacts = await generateGaneshaContactsFromSupabase();
        const code = generateContactsCode(contacts);

        return NextResponse.json({
          message: `📝 Generated TypeScript code for ${contacts.length} contacts`,
          code,
          instructions: [
            '1. Copy the generated code below',
            '2. Replace the ganeshaContacts array in lib/ganesha/contacts.ts',
            '3. Your email system will now have access to all your consciousness pioneers!'
          ],
          totalContacts: contacts.length
        });
      }

      case 'export-raw': {
        // Export raw Supabase data for review
        const rawData = await exportBetaTestersFromSupabase();

        return NextResponse.json({
          message: `📊 Raw Supabase data for ${rawData.length} approved beta testers`,
          rawData,
          totalRaw: rawData.length,
          next: 'Use action=contacts to see converted Ganesha format'
        });
      }

      default: {
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: ['stats', 'contacts', 'generate-code', 'export-raw']
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error('❌ [Ganesha Export API] Error:', error);

    return NextResponse.json({
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Check Supabase connection',
        'Verify beta_signups table exists',
        'Ensure approved beta testers exist in database'
      ]
    }, { status: 500 });
  }
}

// Handle POST for triggering specific export actions
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action } = data;

    if (action === 'update-contacts-file') {
      // This would require file system access
      // For now, return the code to manually update
      const contacts = await generateGaneshaContactsFromSupabase();
      const code = generateContactsCode(contacts);

      return NextResponse.json({
        success: true,
        message: `📝 Ready to update contacts.ts with ${contacts.length} consciousness pioneers`,
        code,
        instructions: [
          'Copy the code provided',
          'Open lib/ganesha/contacts.ts',
          'Replace the ganeshaContacts array content',
          'Save the file',
          'Your Ganesha email system is now ready!'
        ]
      });
    }

    return NextResponse.json({
      error: 'Invalid action',
      availableActions: ['update-contacts-file']
    }, { status: 400 });

  } catch (error) {
    console.error('❌ [Ganesha Export API POST] Error:', error);

    return NextResponse.json({
      error: 'Export action failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}