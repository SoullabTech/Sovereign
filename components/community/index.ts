/**
 * COMMUNITY COMPONENT KIT
 *
 * A collection of UI components for the MAIA Community features.
 * All components follow the Soullab Design Canon:
 * - Warm off-white backgrounds (#f8f7f5)
 * - Sage (#5a7a6f), Violet (#6b5a98), Gold (#8a7a5a) accent colors
 * - Geometric SVG symbols instead of emojis
 * - Refined typography with tracking-wide
 * - Border: border-stone-200/60
 * - Rounded corners: rounded-xl
 *
 * @see /docs/SOULLAB_DESIGN_CANON.md
 */

// ============================================================================
// COMMUNITY POST CARD
// ============================================================================

export {
  default as CommunityPostCard,
  // Types
  type PostType,
  type MemberTier,
  type PostAuthor,
  type PostEngagement,
  type CommunityPost,
  type CommunityPostCardProps,
  // Components
  Avatar,
  // Tier Symbols
  TouchSymbol,
  ContinuitySymbol,
  StewardshipSymbol,
  // Utility functions
  getTierColor,
  getTierBgColor,
  getTierName,
  formatRelativeTime
} from './CommunityPostCard';

// ============================================================================
// COMMENT THREAD
// ============================================================================

export {
  default as CommentThread,
  // Types
  type CommentAuthor,
  type Comment,
  type CommentThreadProps,
  type SingleCommentProps,
  // Components
  SingleComment,
  // Symbols
  ReplySymbol,
  ReactionSymbol,
  ChevronSymbol
} from './CommentThread';

// ============================================================================
// MEMBER PROFILE CARD
// ============================================================================

export {
  default as MemberProfileCard,
  // Types
  type MemberProfile,
  type MemberProfileCardProps,
  // Components
  ProfileAvatar,
  TierBadge,
  CompactProfileCard,
  ExpandedProfileCard,
  // Utility functions
  getTierSymbol,
  getTierDescription,
  formatJoinDate
} from './MemberProfileCard';

// ============================================================================
// REACTION BAR
// ============================================================================

export {
  default as ReactionBar,
  // Types
  type ReactionType,
  type Reaction,
  type ReactionBarProps,
  // Components
  ReactionButton,
  AddReactionButton,
  // Symbols
  ResonanceSymbol,
  InsightSymbol,
  GratitudeSymbol,
  BreakthroughSymbol,
  SupportSymbol,
  // Config
  REACTION_CONFIG
} from './ReactionBar';

// ============================================================================
// ACTIVITY FEED ITEM
// ============================================================================

export {
  default as ActivityFeedItem,
  // Types
  type ActivityType,
  type ActivityActor,
  type ActivityTarget,
  type Activity,
  type ActivityFeedItemProps,
  type ActivityFeedProps,
  // Components
  ActivityFeed,
  CompactActivityItem,
  DetailedActivityItem,
  // Symbols
  PostedSymbol,
  CommentedSymbol,
  ReactedSymbol,
  JoinedSymbol,
  RepliedSymbol,
  // Note: BreakthroughSymbol is also exported from ReactionBar
  // Config
  ACTIVITY_CONFIG,
  // Utility functions
  buildActivityDescription
} from './ActivityFeedItem';
