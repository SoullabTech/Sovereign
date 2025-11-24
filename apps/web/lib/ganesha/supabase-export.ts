/**
 * Supabase Beta Tester Export Tool for Ganesha
 * Export your 50+ consciousness pioneers from Supabase to Ganesha contact system
 */

import { createClient } from '@/lib/supabase/server';
import { GaneshaContact, ContactGroup } from './contacts';

export interface SupabaseBetaTester {
  beta_access_id: string;
  first_name: string;
  last_name: string;
  email: string;
  city: string;
  preferred_element: string;
  has_webcam: boolean;
  has_microphone: boolean;
  tech_background: string;
  motivation: string;
  consent_analytics: boolean;
  consent_contact: boolean;
  status: 'pending' | 'approved' | 'rejected';
  signup_source: string;
  created_at: string;
  metadata: any;
}

/**
 * Export all beta testers from Supabase
 */
export async function exportBetaTestersFromSupabase(includeAllStatuses = false): Promise<SupabaseBetaTester[]> {
  try {
    const supabase = createClient();

    // Check what beta testers exist first
    const { data: allSignups, error: countError } = await supabase
      .from('beta_signups')
      .select('status, count(*)', { count: 'exact' });

    if (countError) {
      console.error('❌ [Ganesha Export] Supabase count error:', countError);
    } else {
      console.log(`📊 [Ganesha Export] Beta signup status breakdown:`, allSignups);
    }

    // Build query based on whether to include all statuses
    let query = supabase
      .from('beta_signups')
      .select('*')
      .order('created_at', { ascending: true });

    if (!includeAllStatuses) {
      // Try approved first
      query = query.eq('status', 'approved');
    }

    const { data: betaSignups, error } = await query;

    if (error) {
      console.error('❌ [Ganesha Export] Supabase error:', error);
      return [];
    }

    if (!betaSignups || betaSignups.length === 0) {
      console.warn(`⚠️ [Ganesha Export] No ${includeAllStatuses ? '' : 'approved '}beta testers found`);

      // If no approved found, let's check for any status
      if (!includeAllStatuses) {
        console.log('🔍 [Ganesha Export] Checking for beta testers with any status...');
        return await exportBetaTestersFromSupabase(true);
      }

      return [];
    }

    const statusText = includeAllStatuses ? '' : 'approved ';
    console.log(`🧠 [Ganesha Export] Found ${betaSignups.length} ${statusText}consciousness pioneers`);
    return betaSignups;

  } catch (error) {
    console.error('❌ [Ganesha Export] Export failed:', error);
    return [];
  }
}

/**
 * Convert Supabase beta tester to Ganesha contact format
 */
export function convertToGaneshaContact(betaTester: SupabaseBetaTester, index: number): GaneshaContact {
  const fullName = `${betaTester.first_name} ${betaTester.last_name}`;

  // Determine contribution based on their data
  const contributions = [];
  if (betaTester.tech_background) contributions.push('Technical insights');
  if (betaTester.has_microphone) contributions.push('Voice journaling');
  if (betaTester.has_webcam) contributions.push('Video feedback');
  if (betaTester.motivation) contributions.push('Consciousness exploration');

  const contribution = contributions.length > 0
    ? contributions.join(', ')
    : 'Early consciousness exploration and platform feedback';

  // Determine tags based on their profile
  const tags = ['early-adopter', 'consciousness-pioneer'];
  if (betaTester.tech_background) tags.push('technical-feedback');
  if (betaTester.preferred_element !== 'aether') tags.push(`${betaTester.preferred_element}-aligned`);
  if (betaTester.has_microphone && betaTester.has_webcam) tags.push('full-engagement');

  return {
    id: betaTester.beta_access_id || `beta-${String(index + 1).padStart(3, '0')}`,
    name: fullName,
    email: betaTester.email,
    joinDate: betaTester.created_at.split('T')[0], // Convert to YYYY-MM-DD
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'] as ContactGroup[],
    tags,
    metadata: {
      source: 'beta-program-supabase',
      contribution,
      city: betaTester.city,
      preferredElement: betaTester.preferred_element,
      techBackground: betaTester.tech_background,
      motivation: betaTester.motivation,
      hasWebcam: betaTester.has_webcam,
      hasMicrophone: betaTester.has_microphone,
      signupSource: betaTester.signup_source,
      preferences: {
        newsletters: betaTester.consent_contact,
        updates: betaTester.consent_contact,
        events: true
      }
    }
  };
}

/**
 * Generate the full Ganesha contacts array from Supabase data
 */
export async function generateGaneshaContactsFromSupabase(): Promise<GaneshaContact[]> {
  const betaTesters = await exportBetaTestersFromSupabase();

  if (betaTesters.length === 0) {
    console.warn('⚠️ [Ganesha Export] No beta testers to convert');
    return [];
  }

  const ganeshaContacts = betaTesters.map((tester, index) =>
    convertToGaneshaContact(tester, index)
  );

  // Add Kelly as founder (if not already included)
  const kellyExists = ganeshaContacts.some(contact =>
    contact.email === 'kelly@soullab.life'
  );

  if (!kellyExists) {
    ganeshaContacts.unshift({
      id: 'founder-kelly',
      name: 'Kelly Nezat',
      email: 'kelly@soullab.life',
      joinDate: '2024-01-01',
      status: 'active',
      groups: ['founders', 'beta-testers', 'consciousness-pioneers', 'newsletter'],
      tags: ['founder', 'architect', 'consciousness-pioneer'],
      metadata: {
        source: 'founder',
        contribution: 'Platform architecture and consciousness framework development',
        preferences: {
          newsletters: true,
          updates: true,
          events: true
        }
      }
    });
  }

  console.log(`🚀 [Ganesha Export] Generated ${ganeshaContacts.length} Ganesha contacts`);
  return ganeshaContacts;
}

/**
 * Generate TypeScript code for contacts.ts file
 */
export function generateContactsCode(contacts: GaneshaContact[]): string {
  const contactStrings = contacts.map(contact => {
    const metadataStr = JSON.stringify(contact.metadata, null, 6).replace(/"/g, "'");
    const groupsStr = contact.groups.map(g => `'${g}'`).join(', ');
    const tagsStr = contact.tags.map(t => `'${t}'`).join(', ');

    return `  {
    id: '${contact.id}',
    name: '${contact.name}',
    email: '${contact.email}',
    joinDate: '${contact.joinDate}',
    status: 'active',
    groups: [${groupsStr}] as ContactGroup[],
    tags: [${tagsStr}],
    metadata: ${metadataStr}
  }`;
  });

  return contactStrings.join(',\n\n');
}

/**
 * Export stats for your consciousness pioneer community
 */
export async function getExportStats(): Promise<{
  totalExported: number;
  byElement: Record<string, number>;
  byCities: string[];
  withTechBackground: number;
  withMicrophone: number;
  withWebcam: number;
  emailList: string[];
}> {
  const contacts = await generateGaneshaContactsFromSupabase();

  const stats = {
    totalExported: contacts.length,
    byElement: contacts.reduce((acc, c) => {
      const element = c.metadata.preferredElement || 'aether';
      acc[element] = (acc[element] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCities: [...new Set(contacts.map(c => c.metadata.city).filter(Boolean))],
    withTechBackground: contacts.filter(c => c.metadata.techBackground).length,
    withMicrophone: contacts.filter(c => c.metadata.hasMicrophone).length,
    withWebcam: contacts.filter(c => c.metadata.hasWebcam).length,
    emailList: contacts.map(c => c.email)
  };

  return stats;
}

// Console logging for Ganesha
console.log('🧠 [Ganesha Export] Supabase export tool ready for consciousness pioneer migration');