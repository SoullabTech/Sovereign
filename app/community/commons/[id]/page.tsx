// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Star, Eye, MessageSquare, Brain, Calendar, User, Tag } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  is_published: boolean;
  cognitive_level_at_post?: number;
  cognitive_stability_at_post?: string;
}

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/community/commons/posts/${postId}`);
      const data = await response.json();

      if (data.ok) {
        setPost(data.post);
      } else {
        setError(data.message || 'Failed to fetch post');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderMarkdown = (markdown: string): JSX.Element[] => {
    const lines = markdown.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-2 text-slate-300">
            {currentList.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const formatInlineMarkdown = (text: string): string => {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-400">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
        .replace(/`(.+?)`/g, '<code class="px-2 py-1 bg-slate-800 rounded text-sm">$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-amber-400 hover:text-amber-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    };

    lines.forEach((line, idx) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${elements.length}`} className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4 overflow-x-auto">
              <code className="text-sm text-slate-300">{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${idx}`} className="text-xl font-semibold text-amber-400 mt-8 mb-4">
            {line.substring(4)}
          </h3>
        );
        return;
      }

      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${idx}`} className="text-2xl font-bold text-amber-400 mt-10 mb-5">
            {line.substring(3)}
          </h2>
        );
        return;
      }

      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${idx}`} className="text-3xl font-bold text-amber-400 mt-12 mb-6">
            {line.substring(2)}
          </h1>
        );
        return;
      }

      // Lists
      if (line.match(/^[-*]\s/)) {
        currentList.push(line.substring(2));
        return;
      }

      // Regular paragraph
      if (line.trim()) {
        flushList();
        elements.push(
          <p
            key={`p-${idx}`}
            className="text-slate-300 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
          />
        );
      } else {
        flushList();
      }
    });

    flushList();
    return elements;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/community/commons')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10
                     border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Commons
          </button>
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error || 'Post not found'}</p>
            <button
              onClick={() => router.push('/community/commons')}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Return to Commons
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/community/commons')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10
                   border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Commons
        </button>

        {/* Post Header */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-100 flex-1">{post.title}</h1>
            {post.is_featured && (
              <div className="flex-shrink-0 ml-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 text-sm font-medium">Featured</span>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.view_count || 0} views</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{post.comment_count || 0} comments</span>
            </div>
            {post.cognitive_level_at_post && (
              <div className="flex items-center gap-2 text-amber-500/70">
                <Brain className="w-4 h-4" />
                <span>Level {post.cognitive_level_at_post.toFixed(1)}</span>
                {post.cognitive_stability_at_post && (
                  <span className="text-slate-500">({post.cognitive_stability_at_post})</span>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => router.push(`/community/commons?tag=${tag}`)}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-800/50 border border-slate-700
                           text-slate-400 text-sm rounded-md hover:bg-slate-800 hover:text-amber-400 transition-all"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-6">
          <div className="prose prose-invert prose-amber max-w-none">
            {renderMarkdown(post.content)}
          </div>
        </div>

        {/* Comments Section Placeholder */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments
          </h2>
          <div className="text-center py-12">
            <p className="text-slate-500">Comments feature coming soon.</p>
            <p className="text-slate-600 text-sm mt-2">
              Share your reflections and engage with this wisdom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
