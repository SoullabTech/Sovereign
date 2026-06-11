// SoulComms — Team Messaging Types

export interface PromptScaffoldField {
  label: string;
  placeholder: string;
  required: boolean;
}

export interface TeamChannel {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  channelType: 'text' | 'announcement';
  isPrivate: boolean;
  createdBy: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Practice infrastructure
  archetype?: 'checkin' | 'field_note' | 'practice' | 'cohort' | 'venture' | 'general';
  purposeBlock?: string | null;
  promptScaffold?: PromptScaffoldField[] | null;
  responseMode?: 'witnessing' | 'reflection' | 'advice' | 'open';
  // Computed
  unreadCount?: number;
}

export type MessageAttachmentKind = 'image';

/**
 * Client-facing attachment metadata on a message. `url` is a conversation-scoped
 * serve endpoint; the underlying vault `storagePath` is server-only and never sent.
 */
export interface MessageAttachment {
  id: string;
  kind: MessageAttachmentKind;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  url: string;
}

/**
 * Persisted shape inside a message row's `attachments` JSONB (server-only). Carries
 * the vault `storagePath` instead of a serve URL — converted to MessageAttachment
 * before leaving the server.
 */
export interface StoredMessageAttachment {
  id: string;
  kind: MessageAttachmentKind;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  storagePath: string;
}

export interface TeamMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderType?: 'member' | 'maia';
  body: string;
  parentId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  messageKind?: MessageKind;
  // Computed
  reactions: MessageReaction[];
  replyCount?: number;
  attachments?: MessageAttachment[];
  // Sender-side attention receipts for the sender's OWN messages (Sent / Opened / Resolved / Declined).
  // "opened" is receipt that it reached the recipient — never agreement/consent (D2).
  attentionStates?: {
    recipientName: string;
    kind: string;
    status: 'open' | 'resolved' | 'declined';
    opened: boolean;
  }[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  memberIds: string[];
  hasMine: boolean;
}

export interface TeamMemberPresence {
  memberId: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  lastSeenAt: string;
}

export type MessageKind = 'build' | 'question' | 'decision' | 'insight' | 'request';

export interface SendMessageBody {
  body: string;
  parentId?: string;
  messageKind?: MessageKind;
}

export interface ChannelMember {
  memberId: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}
