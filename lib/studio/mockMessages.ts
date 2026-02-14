/**
 * STUDIO COMMS — Shared Message Type + Mock Data
 *
 * Shared so both /studio/comms (list) and /studio/comms/[messageId] (detail)
 * read from the same source. Replace with real data/service later.
 */

export interface Message {
  id: string;
  type: 'email' | 'sms' | 'notification' | 'internal';
  from: string;
  to?: string;
  subject: string;
  preview: string;
  content?: string;
  status: 'unread' | 'read' | 'replied' | 'archived' | 'sent';
  starred: boolean;
  timestamp: string;
  priority?: 'normal' | 'high';
}

export const mockMessages: Message[] = [
  {
    id: '1',
    type: 'email',
    from: 'Sarah Chen',
    subject: 'Re: Q1 Strategy Session Follow-up',
    preview: 'Thanks for the session yesterday! I had a few follow-up thoughts on the delegation framework we discussed...',
    status: 'unread',
    starred: true,
    timestamp: '10:32 AM',
    priority: 'high',
  },
  {
    id: '2',
    type: 'sms',
    from: 'You',
    to: '+1 (555) 123-4567',
    subject: 'Session Reminder',
    preview: 'Hi Sarah, this is a reminder about your session tomorrow at 2pm. Reply YES to confirm.',
    status: 'sent',
    starred: false,
    timestamp: '9:45 AM',
  },
  {
    id: '3',
    type: 'notification',
    from: 'MAIA',
    subject: 'Agent task completed',
    preview: 'The voice mode initialization fix has been completed and is ready for review.',
    status: 'unread',
    starred: false,
    timestamp: '9:30 AM',
  },
  {
    id: '4',
    type: 'email',
    from: 'Marcus Johnson',
    subject: 'Rescheduling Friday session',
    preview: 'Hi, I need to move our Friday session to next week if possible. Does Tuesday work?',
    status: 'read',
    starred: false,
    timestamp: 'Yesterday',
  },
  {
    id: '5',
    type: 'sms',
    from: '+1 (555) 987-6543',
    subject: 'Incoming SMS',
    preview: 'Yes, confirmed! See you tomorrow.',
    status: 'unread',
    starred: false,
    timestamp: 'Yesterday',
  },
  {
    id: '6',
    type: 'notification',
    from: 'System',
    subject: 'New client registration',
    preview: 'A new user has completed onboarding: Elena Rodriguez',
    status: 'read',
    starred: false,
    timestamp: 'Yesterday',
  },
  {
    id: '7',
    type: 'internal',
    from: 'Triage Queue',
    subject: 'High priority item needs attention',
    preview: 'iOS build failing on TestFlight upload has been marked as urgent.',
    status: 'replied',
    starred: true,
    timestamp: '2 days ago',
  },
];
