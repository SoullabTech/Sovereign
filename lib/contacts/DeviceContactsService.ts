/**
 * DEVICE CONTACTS SERVICE
 *
 * Accesses native phone contacts on iOS/Android via Capacitor.
 * Falls back gracefully on web.
 */

import { Capacitor } from '@capacitor/core';

export interface DeviceContact {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
}

// Dynamic import to avoid SSR issues
let ContactsPlugin: {
  getContacts: (options: { projection: { name: boolean; phones: boolean; emails: boolean; image: boolean } }) => Promise<{ contacts: ContactPayload[] }>;
  requestPermissions: () => Promise<{ contacts: string }>;
  checkPermissions: () => Promise<{ contacts: string }>;
} | null = null;

interface ContactPayload {
  contactId: string;
  name?: {
    display?: string;
    given?: string;
    family?: string;
  };
  phones?: Array<{ number?: string; type?: string }>;
  emails?: Array<{ address?: string; type?: string }>;
  image?: { base64String?: string };
}

/**
 * Initialize the Contacts plugin (must be called client-side)
 */
async function initPlugin(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!Capacitor.isNativePlatform()) return false;

  try {
    // @capacitor-community/contacts must be installed separately
    const module = await import(/* webpackIgnore: true */ '@capacitor-community/contacts');
    ContactsPlugin = module.Contacts;
    return true;
  } catch (error) {
    console.warn('[DeviceContacts] Contacts plugin not available:', error);
    return false;
  }
}

/**
 * Check if device contacts are available
 */
export async function isAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!Capacitor.isNativePlatform()) return false;

  await initPlugin();
  return !!ContactsPlugin;
}

/**
 * Request contacts permission
 */
export async function requestPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!ContactsPlugin) {
    await initPlugin();
  }

  if (!ContactsPlugin) {
    return 'denied';
  }

  try {
    const result = await ContactsPlugin.requestPermissions();
    return result.contacts as 'granted' | 'denied' | 'prompt';
  } catch (error) {
    console.error('[DeviceContacts] Permission request failed:', error);
    return 'denied';
  }
}

/**
 * Check contacts permission status
 */
export async function checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!ContactsPlugin) {
    await initPlugin();
  }

  if (!ContactsPlugin) {
    return 'denied';
  }

  try {
    const result = await ContactsPlugin.checkPermissions();
    return result.contacts as 'granted' | 'denied' | 'prompt';
  } catch (error) {
    console.error('[DeviceContacts] Permission check failed:', error);
    return 'denied';
  }
}

/**
 * Fetch device contacts
 */
export async function fetchDeviceContacts(): Promise<DeviceContact[]> {
  if (!ContactsPlugin) {
    await initPlugin();
  }

  if (!ContactsPlugin) {
    throw new Error('Contacts plugin not available');
  }

  // Check/request permission first
  let permission = await checkPermission();
  if (permission === 'prompt') {
    permission = await requestPermission();
  }

  if (permission !== 'granted') {
    throw new Error('Contacts permission denied');
  }

  try {
    const result = await ContactsPlugin.getContacts({
      projection: {
        name: true,
        phones: true,
        emails: true,
        image: false, // Skip images to reduce payload size
      },
    });

    const contacts: DeviceContact[] = result.contacts.map((c: ContactPayload) => ({
      id: c.contactId,
      name: c.name?.display || null,
      firstName: c.name?.given || null,
      lastName: c.name?.family || null,
      email: c.emails?.[0]?.address || null,
      phone: c.phones?.[0]?.number || null,
      photoUrl: null, // Skip for performance
    }));

    // Filter to only contacts with name and email/phone
    return contacts.filter(c => c.name && (c.email || c.phone));
  } catch (error) {
    console.error('[DeviceContacts] Fetch failed:', error);
    throw error;
  }
}

export const DeviceContactsService = {
  isAvailable,
  requestPermission,
  checkPermission,
  fetchContacts: fetchDeviceContacts,
};

export default DeviceContactsService;
