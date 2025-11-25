/**
 * Ganesha Contact Import Tool
 * Convert your existing beta tester list to organized Ganesha contact system
 */

import { GaneshaContact, ContactGroup } from './contacts';

// 🚀 EASY IMPORT - Paste your beta testers here (just name and email)
export const rawBetaTesters = [
  // PASTE YOUR BETA TESTERS HERE in this simple format:
  // { name: "John Smith", email: "john@email.com" },
  // { name: "Jane Doe", email: "jane@email.com" },
  // { name: "Alex Johnson", email: "alex@email.com" },

  // Example (replace with your actual list):
  { name: "Test Pioneer 1", email: "pioneer1@example.com" },
  { name: "Test Pioneer 2", email: "pioneer2@example.com" },

  // 🧠 ADD ALL 50+ OF YOUR CONSCIOUSNESS PIONEERS HERE 🧠
  // Just copy/paste in the format: { name: "Name", email: "email@domain.com" },
];

/**
 * Convert raw beta tester list to full Ganesha contacts
 */
export function convertToGaneshaContacts(): GaneshaContact[] {
  return rawBetaTesters.map((tester, index) => ({
    id: `beta-${String(index + 1).padStart(3, '0')}`, // beta-001, beta-002, etc.
    name: tester.name,
    email: tester.email,
    joinDate: '2024-01-01', // You can update individual dates later if needed
    status: 'active' as const,
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'] as ContactGroup[],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  }));
}

/**
 * Generate the contact array code for easy copy/paste
 */
export function generateContactCode(): string {
  const contacts = convertToGaneshaContacts();

  const contactStrings = contacts.map(contact => `  {
    id: '${contact.id}',
    name: '${contact.name}',
    email: '${contact.email}',
    joinDate: '${contact.joinDate}',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  }`);

  return contactStrings.join(',\n\n');
}

// 📊 Quick stats for your import
export function getImportStats() {
  const contacts = convertToGaneshaContacts();

  return {
    totalContacts: contacts.length,
    betaTesters: contacts.filter(c => c.groups.includes('beta-testers')).length,
    newsletterSubscribers: contacts.filter(c => c.groups.includes('newsletter')).length,
    emailList: contacts.map(c => c.email)
  };
}

// 🧠 Ganesha-style logging
console.log('🧠 [Ganesha Import] Contact import tool ready');
console.log('📊 Current import stats:', getImportStats());