// SoulComms — Team Messaging Types

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
  // Computed
  unreadCount?: number;
}

export interface TeamMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  body: string;
  parentId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  // Computed
  reactions: MessageReaction[];
  replyCount?: number;
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

export interface SendMessageBody {
  body: string;
  parentId?: string;
}
