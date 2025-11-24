/**
 * Community Storage Module
 * Handles persistence for community posts, comments, and interactions
 */

export interface CommunityPost {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  hearts: number;
  commentCount: number;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  timestamp: number;
}

// In-memory storage for development
const posts: Map<string, CommunityPost> = new Map();
const comments: Map<string, CommunityComment[]> = new Map();
const hearts: Map<string, Set<string>> = new Map();

export async function createPost(post: CommunityPost): Promise<CommunityPost> {
  posts.set(post.id, post);
  return post;
}

export async function getPost(postId: string): Promise<CommunityPost | null> {
  return posts.get(postId) || null;
}

export async function getPosts(limit = 50): Promise<CommunityPost[]> {
  return Array.from(posts.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export async function deletePost(postId: string): Promise<boolean> {
  return posts.delete(postId);
}

export async function createComment(comment: CommunityComment): Promise<CommunityComment> {
  const postComments = comments.get(comment.postId) || [];
  postComments.push(comment);
  comments.set(comment.postId, postComments);

  // Update comment count on post
  const post = posts.get(comment.postId);
  if (post) {
    post.commentCount++;
  }

  return comment;
}

export async function getComments(postId: string): Promise<CommunityComment[]> {
  return comments.get(postId) || [];
}

export async function toggleHeart(postId: string, userId: string): Promise<number> {
  const postHearts = hearts.get(postId) || new Set();

  if (postHearts.has(userId)) {
    postHearts.delete(userId);
  } else {
    postHearts.add(userId);
  }

  hearts.set(postId, postHearts);

  // Update heart count on post
  const post = posts.get(postId);
  if (post) {
    post.hearts = postHearts.size;
  }

  return postHearts.size;
}

export async function hasHearted(postId: string, userId: string): Promise<boolean> {
  const postHearts = hearts.get(postId) || new Set();
  return postHearts.has(userId);
}

/**
 * Main community storage object for unified interface
 */
export const communityStorage = {
  createPost,
  getPost,
  getPosts,
  deletePost,
  createComment,
  getComments,
  toggleHeart,
  hasHearted
};
