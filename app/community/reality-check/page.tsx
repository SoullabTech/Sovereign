"use client";

import React, { useState, useEffect } from "react";
import { IntegrationAuthService } from "../../../lib/auth/integrationAuth";

interface CommunityInteraction {
  id: string;
  user_id: string;
  interaction_type:
    | "reality_check"
    | "integration_validation"
    | "struggle_support"
    | "ordinary_moment_sharing"
    | "bypassing_concern";
  content: string;
  context?: any;
  target_user_id?: string;
  group_context: string;
  visibility: string;
  responses?: any[];
  helpful_count: number;
  reality_grounding_count: number;
  bypassing_concern_count: number;
  flagged: boolean;
  created_at: string;
  user_profiles?: {
    display_name: string;
    community_visibility: string;
  };
}

interface CommunityPost {
  type:
    | "reality_check_request"
    | "integration_share"
    | "struggle_support"
    | "ordinary_moment";
  title: string;
  content: string;
  context?: any;
  visibility: "supportive" | "open";
  tags?: string[];
}

export default function CommunityRealityCheckPage() {
  const authService = new IntegrationAuthService();

  const [interactions, setInteractions] = useState<CommunityInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [newPost, setNewPost] = useState<CommunityPost>({
    type: "reality_check_request",
    title: "",
    content: "",
    visibility: "supportive",
    tags: [],
  });

  useEffect(() => {
    loadCommunityData();
  }, [activeFilter]);

  const loadCommunityData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      setCurrentUser(user);

      // Load community interactions
      const response = await fetch(
        `/api/community/interactions?filter=${activeFilter}`,
      );
      if (response.ok) {
        const data = await response.json();
        setInteractions(data);
      }
    } catch (error) {
      console.error("Community data loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    if (!currentUser || !newPost.title.trim() || !newPost.content.trim())
      return;

    try {
      const response = await fetch("/api/community/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          interaction_type: newPost.type,
          content: JSON.stringify({
            title: newPost.title,
            content: newPost.content,
            tags: newPost.tags,
          }),
          context: newPost.context,
          group_context: "general",
          visibility: newPost.visibility,
        }),
      });

      if (response.ok) {
        setShowPostForm(false);
        setNewPost({
          type: "reality_check_request",
          title: "",
          content: "",
          visibility: "supportive",
          tags: [],
        });
        loadCommunityData();
      }
    } catch (error) {
      console.error("Post submission error:", error);
    }
  };

  const respondToInteraction = async (
    interactionId: string,
    responseType: string,
    content: string,
  ) => {
    try {
      const response = await fetch(
        `/api/community/interactions/${interactionId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            response_type: responseType,
            content,
            user_id: currentUser.id,
          }),
        },
      );

      if (response.ok) {
        loadCommunityData();
      }
    } catch (error) {
      console.error("Response submission error:", error);
    }
  };

  const flagInteraction = async (interactionId: string, reason: string) => {
    try {
      const response = await fetch(
        `/api/community/interactions/${interactionId}/flag`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        },
      );

      if (response.ok) {
        loadCommunityData();
      }
    } catch (error) {
      console.error("Flag submission error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Community Reality-Checking
              </h1>
              <p className="text-sm text-gray-600">
                Support each other&apos;s integration through grounded feedback
              </p>
            </div>

            <button
              onClick={() => setShowPostForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share / Ask
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "all", label: "All Posts" },
              { id: "reality_check", label: "Reality Checks" },
              { id: "integration_validation", label: "Integration Support" },
              { id: "struggle_support", label: "Struggle Support" },
              { id: "ordinary_moment_sharing", label: "Ordinary Moments" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeFilter === filter.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Community Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">
            Community Guidelines
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Focus on reality-grounding and practical application</li>
            <li>• Celebrate ordinary moments and consistent practices</li>
            <li>• Gently redirect spiritual bypassing with compassion</li>
            <li>• Share struggles and mistakes as sources of wisdom</li>
            <li>• Validate the slow, spiral nature of growth</li>
          </ul>
        </div>

        {/* Post Creation Form */}
        {showPostForm && (
          <PostCreationForm
            post={newPost}
            onChange={setNewPost}
            onSubmit={submitPost}
            onCancel={() => setShowPostForm(false)}
          />
        )}

        {/* Community Interactions */}
        <div className="space-y-6">
          {interactions.length > 0 ? (
            interactions.map((interaction) => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                currentUser={currentUser}
                onRespond={respondToInteraction}
                onFlag={flagInteraction}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No community interactions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to share or ask for reality-checking support
              </p>
              <button
                onClick={() => setShowPostForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start a Conversation
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const PostCreationForm: React.FC<{
  post: CommunityPost;
  onChange: (post: CommunityPost) => void;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ post, onChange, onSubmit, onCancel }) => {
  const postTypes = [
    {
      value: "reality_check_request",
      label: "Reality Check Request",
      description: "Ask for grounding perspective on an insight or experience",
    },
    {
      value: "integration_share",
      label: "Integration Share",
      description: "Share how you&apos;re applying insights in daily life",
    },
    {
      value: "struggle_support",
      label: "Struggle Support",
      description: "Share challenges and seek supportive feedback",
    },
    {
      value: "ordinary_moment",
      label: "Ordinary Moment",
      description: "Celebrate awareness in mundane daily experiences",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Share with Community</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {postTypes.map((type) => (
              <label
                key={type.value}
                className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="postType"
                  value={type.value}
                  checked={post.type === type.value}
                  onChange={(e) =>
                    onChange({ ...post, type: e.target.value as any })
                  }
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {type.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={post.title}
            onChange={(e) => onChange({ ...post, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief, descriptive title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={post.content}
            onChange={(e) => onChange({ ...post, content: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your experience, insight, or question. Include practical details about how this shows up in your daily life..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibility
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="supportive"
                checked={post.visibility === "supportive"}
                onChange={(e) =>
                  onChange({ ...post, visibility: e.target.value as any })
                }
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Supportive Community
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="open"
                checked={post.visibility === "open"}
                onChange={(e) =>
                  onChange({ ...post, visibility: e.target.value as any })
                }
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Open Community</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!post.title.trim() || !post.content.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

const InteractionCard: React.FC<{
  interaction: CommunityInteraction;
  currentUser: any;
  onRespond: (id: string, type: string, content: string) => void;
  onFlag: (id: string, reason: string) => void;
}> = ({ interaction, currentUser, onRespond, onFlag }) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseContent, setResponseContent] = useState("");
  const [responseType, setResponseType] = useState("supportive");

  let parsedContent;
  try {
    parsedContent = JSON.parse(interaction.content);
  } catch {
    parsedContent = { title: "Community Share", content: interaction.content };
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "reality_check":
        return "🔍";
      case "integration_validation":
        return "🌱";
      case "struggle_support":
        return "💪";
      case "ordinary_moment_sharing":
        return "✨";
      case "bypassing_concern":
        return "⚠️";
      default:
        return "💬";
    }
  };

  const getInteractionTypeLabel = (type: string) => {
    switch (type) {
      case "reality_check":
        return "Reality Check Request";
      case "integration_validation":
        return "Integration Share";
      case "struggle_support":
        return "Struggle Support";
      case "ordinary_moment_sharing":
        return "Ordinary Moment";
      case "bypassing_concern":
        return "Bypassing Concern";
      default:
        return "Community Share";
    }
  };

  const submitResponse = () => {
    if (responseContent.trim()) {
      onRespond(interaction.id, responseType, responseContent);
      setResponseContent("");
      setShowResponseForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
            {getInteractionIcon(interaction.interaction_type)}
          </span>
          <div>
            <h3 className="font-medium text-gray-900">{parsedContent.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>
                {interaction.user_profiles?.display_name || "Anonymous"}
              </span>
              <span>•</span>
              <span>
                {getInteractionTypeLabel(interaction.interaction_type)}
              </span>
              <span>•</span>
              <span>
                {new Date(interaction.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onFlag(interaction.id, "inappropriate")}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          Flag
        </button>
      </div>

      <div className="prose max-w-none mb-4">
        <p className="text-gray-700">{parsedContent.content}</p>
      </div>

      {/* Interaction Stats */}
      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
        <span>{interaction.helpful_count} helpful</span>
        <span>{interaction.reality_grounding_count} reality grounding</span>
        {interaction.bypassing_concern_count > 0 && (
          <span className="text-amber-600">
            {interaction.bypassing_concern_count} bypassing concerns
          </span>
        )}
      </div>

      {/* Response Form */}
      {showResponseForm ? (
        <div className="border-t pt-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Type
              </label>
              <select
                value={responseType}
                onChange={(e) => setResponseType(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="supportive">Supportive Feedback</option>
                <option value="reality_grounding">Reality Grounding</option>
                <option value="shared_experience">Shared Experience</option>
                <option value="question">Clarifying Question</option>
                <option value="bypassing_concern">Bypassing Concern</option>
              </select>
            </div>

            <textarea
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your perspective, experience, or gentle reality-check..."
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowResponseForm(false)}
                className="text-gray-600 px-3 py-1 text-sm hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitResponse}
                disabled={!responseContent.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Respond
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowResponseForm(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Respond
          </button>
        </div>
      )}

      {/* Existing Responses */}
      {interaction.responses && interaction.responses.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Community Responses
          </h4>
          <div className="space-y-3">
            {interaction.responses
              .slice(0, 3)
              .map((response: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {response.user_name || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {response.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{response.content}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
