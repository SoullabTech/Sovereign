/**
 * Ganesha Contact Sync API
 * Sync all 46 consciousness pioneers to Supabase database
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ganeshaContacts } from '@/lib/ganesha/contacts';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createClient();

    console.log(`🧠 [Ganesha Sync] Starting sync of ${ganeshaContacts.length} consciousness pioneers...`);

    let successCount = 0;
    let skipCount = 0;
    const errors: Array<{ contact: string; error: string }> = [];

    for (const contact of ganeshaContacts) {
      try {
        // Check if contact already exists
        const { data: existing } = await supabase
          .from('ganesha_contacts')
          .select('id')
          .eq('email', contact.email)
          .single();

        if (existing) {
          console.log(`⏭️  [Ganesha Sync] Skipping existing: ${contact.name} (${contact.email})`);
          skipCount++;
          continue;
        }

        // Insert new contact
        const { error: insertError } = await supabase
          .from('ganesha_contacts')
          .insert({
            id: contact.id,
            name: contact.name,
            email: contact.email,
            status: contact.status,
            join_date: contact.joinDate,
            groups: contact.groups,
            tags: contact.tags,
            metadata: contact.metadata,
            preferences: contact.metadata.preferences || {
              newsletters: true,
              updates: true,
              events: true
            }
          });

        if (insertError) {
          console.error(`❌ [Ganesha Sync] Failed to insert ${contact.name}:`, insertError);
          errors.push({
            contact: `${contact.name} (${contact.email})`,
            error: insertError.message
          });
          continue;
        }

        console.log(`✅ [Ganesha Sync] Synced: ${contact.name} (${contact.email})`);
        successCount++;

      } catch (contactError) {
        console.error(`❌ [Ganesha Sync] Error processing ${contact.name}:`, contactError);
        errors.push({
          contact: `${contact.name} (${contact.email})`,
          error: contactError instanceof Error ? contactError.message : 'Unknown error'
        });
      }
    }

    // Get final stats
    const { data: stats } = await supabase
      .rpc('get_ganesha_contact_stats');

    console.log(`🎉 [Ganesha Sync] Sync complete!`, {
      totalProcessed: ganeshaContacts.length,
      synced: successCount,
      skipped: skipCount,
      errors: errors.length
    });

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${successCount} consciousness pioneers to Ganesha database`,
      results: {
        totalProcessed: ganeshaContacts.length,
        synced: successCount,
        skipped: skipCount,
        errors: errors.length,
        errorDetails: errors
      },
      stats
    });

  } catch (error) {
    console.error('❌ [Ganesha Sync] Sync failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sync error',
      message: 'Failed to sync contacts to Ganesha database'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient();

    // Get current contact stats
    const { data: stats, error: statsError } = await supabase
      .rpc('get_ganesha_contact_stats');

    if (statsError) {
      throw statsError;
    }

    return NextResponse.json({
      success: true,
      message: 'Ganesha contact sync status',
      localContactsCount: ganeshaContacts.length,
      databaseStats: stats,
      needsSync: stats.total_contacts < ganeshaContacts.length,
      readyToSync: true
    });

  } catch (error) {
    console.error('❌ [Ganesha Sync] Status check failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
