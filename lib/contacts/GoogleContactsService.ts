/**
 * GOOGLE CONTACTS SERVICE
 *
 * Fetches contacts from Google People API for client import.
 * Uses the same OAuth tokens as GoogleCalendarService.
 */

import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

const GOOGLE_PEOPLE_API = 'https://people.googleapis.com/v1';

export interface GoogleContact {
  resourceName: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  organization: string | null;
}

interface PersonResource {
  resourceName: string;
  names?: Array<{
    displayName?: string;
    givenName?: string;
    familyName?: string;
  }>;
  emailAddresses?: Array<{
    value?: string;
    type?: string;
  }>;
  phoneNumbers?: Array<{
    value?: string;
    type?: string;
  }>;
  photos?: Array<{
    url?: string;
    default?: boolean;
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
  }>;
}

/**
 * Fetch contacts from Google People API
 */
export async function fetchGoogleContacts(
  userId: string,
  pageSize: number = 100,
  pageToken?: string
): Promise<{ contacts: GoogleContact[]; nextPageToken?: string }> {
  const accessToken = await GoogleCalendarService.getValidAccessToken(userId);

  if (!accessToken) {
    throw new Error('No valid access token - user may need to reconnect Google');
  }

  const params = new URLSearchParams({
    personFields: 'names,emailAddresses,phoneNumbers,photos,organizations',
    pageSize: pageSize.toString(),
    sortOrder: 'LAST_MODIFIED_DESCENDING',
  });

  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const response = await fetch(
    `${GOOGLE_PEOPLE_API}/people/me/connections?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('[GoogleContacts] API error:', response.status, error);

    if (response.status === 401) {
      throw new Error('Google authorization expired - please reconnect');
    }

    throw new Error(`Failed to fetch contacts: ${response.status}`);
  }

  const data = await response.json();

  const contacts: GoogleContact[] = (data.connections || []).map((person: PersonResource) => {
    const name = person.names?.[0];
    const email = person.emailAddresses?.[0];
    const phone = person.phoneNumbers?.[0];
    const photo = person.photos?.find(p => !p.default);
    const org = person.organizations?.[0];

    return {
      resourceName: person.resourceName,
      name: name?.displayName || null,
      firstName: name?.givenName || null,
      lastName: name?.familyName || null,
      email: email?.value || null,
      phone: phone?.value || null,
      photoUrl: photo?.url || null,
      organization: org?.name || null,
    };
  });

  // Filter out contacts without name or email/phone
  const validContacts = contacts.filter(c =>
    c.name && (c.email || c.phone)
  );

  return {
    contacts: validContacts,
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Fetch all contacts (handles pagination)
 */
export async function fetchAllGoogleContacts(
  userId: string,
  maxContacts: number = 500
): Promise<GoogleContact[]> {
  const allContacts: GoogleContact[] = [];
  let pageToken: string | undefined;

  do {
    const result = await fetchGoogleContacts(userId, 100, pageToken);
    allContacts.push(...result.contacts);
    pageToken = result.nextPageToken;
  } while (pageToken && allContacts.length < maxContacts);

  return allContacts.slice(0, maxContacts);
}

export const GoogleContactsService = {
  fetchContacts: fetchGoogleContacts,
  fetchAllContacts: fetchAllGoogleContacts,
};

export default GoogleContactsService;
