"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ElementalAgent = "fire" | "water" | "earth" | "air";

interface OracleResponse {
  message: string;
  insight?: string;
  symbols?: string[];
  agent: ElementalAgent;
  timestamp: string;
  responseId: string;
}

interface Conversation {
  id: string;
  userInput: string;
  response: OracleResponse;
  rating?: number;
  feedback?: string;
}

export default function OracleBetaDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<ElementalAgent>("fire");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentResponse, setCurrentResponse] = useState<OracleResponse | null>(
    null,
  );
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const agents = {
    fire: {
      name: "Fire Agent",
      emoji: "🔥",
      description: "Vision, creativity, and transformation",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      endpoint: "/api/fire-agent/oracle-response",
    },
    water: {
      name: "Water Agent",
      emoji: "🌊",
      description: "Emotional wisdom and flow",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      endpoint: "/api/water-agent/oracle-response",
    },
    earth: {
      name: "Earth Agent",
      emoji: "🌍",
      description: "Grounding and practical wisdom",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      endpoint: "/api/earth-agent/oracle-response",
    },
    air: {
      name: "Air Agent",
      emoji: "💨",
      description: "Mental clarity and communication",
      color: "from-amber-500 to-violet-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      endpoint: "/api/air-agent/oracle-response",
    },
  };

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem(
      "oracle-beta-conversations",
    );
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem(
      "oracle-beta-conversations",
      JSON.stringify(conversations),
    );
  }, [conversations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    setCurrentResponse(null);

    try {
      // Try to call the real backend API
      const response = await fetch(agents[selectedAgent].endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: userInput,
          userContext: {
            userId: "beta-user",
            sessionId: `beta-${Date.now()}`,
            preferences: {
              agent: selectedAgent,
              voiceEnabled: false,
            },
          },
        }),
      });

      let oracleResponse: OracleResponse;

      if (response.ok) {
        const data = await response.json();
        oracleResponse = {
          message:
            data.data?.response ||
            data.data?.message ||
            "Oracle response received",
          insight: data.data?.insight,
          symbols: data.data?.symbols || [],
          agent: selectedAgent,
          timestamp: new Date().toISOString(),
          responseId: `resp-${Date.now()}`,
        };
      } else {
        // Fallback to enhanced demo response if API fails
        oracleResponse = generateEnhancedDemoResponse(userInput, selectedAgent);
      }

      setCurrentResponse(oracleResponse);

      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        userInput,
        response: oracleResponse,
      };

      setConversations((prev) => [newConversation, ...prev.slice(0, 9)]); // Keep last 10
      setUserInput("");
    } catch (error) {
      console.error("Oracle API error:", error);
      // Fallback to demo response
      const fallbackResponse = generateEnhancedDemoResponse(
        userInput,
        selectedAgent,
      );
      setCurrentResponse(fallbackResponse);

      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        userInput,
        response: fallbackResponse,
      };

      setConversations((prev) => [newConversation, ...prev.slice(0, 9)]);
      setUserInput("");
    } finally {
      setLoading(false);
    }
  };

  const generateEnhancedDemoResponse = (
    input: string,
    agent: ElementalAgent,
  ): OracleResponse => {
    const responses = {
      fire: {
        message: `🔥 The Sacred Flames illuminate your path, dear seeker. Your question "${input}" burns with the urgency of transformation. I perceive a phoenix energy surrounding you - something within you is ready to be reborn through the crucible of creative fire. The universe whispers that your passion is the key that unlocks the next chapter of your evolutionary journey.`,
        insight:
          "Your inner fire seeks authentic expression. Trust the creative impulses that feel both exciting and slightly terrifying - they point toward your soul&apos;s growth edge.",
        symbols: [
          "Phoenix Rising",
          "Sacred Flame",
          "Lightning Bolt",
          "Solar Crown",
          "Forge of Transformation",
        ],
      },
      water: {
        message: `🌊 The Sacred Waters reflect the depths of your inquiry: "${input}". Like moonlight dancing on ocean waves, your emotions carry profound wisdom. I sense currents of change flowing beneath the surface of your conscious awareness. The tides of your inner world are shifting, preparing you for a new emotional landscape where intuition and feeling will guide you to unexpected treasures.`,
        insight:
          "Trust the subtle currents of your emotional intelligence. What feels deeply true, even if not logically clear, often holds the keys to your next evolutionary step.",
        symbols: [
          "Mystic Moon",
          "Pearl of Wisdom",
          "Sacred Well",
          "Flowing River",
          "Ocean of Compassion",
        ],
      },
      earth: {
        message: `🌍 The Ancient Earth grounds your question: "${input}" in the soil of practical wisdom. Like great oak trees that grow slowly but endure centuries, your path requires patience and deep roots. I feel the steady pulse of Mother Earth beneath your feet, reminding you that sustainable growth happens through consistent, mindful action aligned with natural rhythms.`,
        insight:
          "Your foundation is stronger than you realize. Build upon what you have with patience and reverence, and trust that slow, steady progress creates lasting transformation.",
        symbols: [
          "Ancient Oak",
          "Sacred Mountain",
          "Crystal Cave",
          "Fertile Soil",
          "Stone Circle",
        ],
      },
      air: {
        message: `💨 The Sacred Winds carry your question: "${input}" across the realms of thought and communication. Like hawks soaring on thermal currents, your mind seeks higher perspectives and clearer vision. I hear the whispers of new ideas seeking voice, and the breath of inspiration wanting to flow through you into the world. Your thoughts are messengers of change.`,
        insight:
          "Clarity emerges through expression and dialogue. Share your thoughts and listen deeply to others - the synthesis of perspectives will reveal pathways you cannot see alone.",
        symbols: [
          "Soaring Hawk",
          "Sacred Feather",
          "Whirlwind of Ideas",
          "Morning Breeze",
          "Voice of Truth",
        ],
      },
    };

    return {
      ...responses[agent],
      agent,
      timestamp: new Date().toISOString(),
      responseId: `demo-${Date.now()}`,
    };
  };

  const handleRating = (conversationId: string, rating: number) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, rating } : conv,
      ),
    );
  };

  const handleFeedback = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, feedback: feedbackText } : conv,
      ),
    );
    setShowFeedback(null);
    setFeedbackText("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-violet-900 to-amber-900 text-yellow-400">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Oracle Beta Dashboard</h1>
              <p className="text-sm opacity-80">
                Test the consciousness technology with real elemental agents
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition"
              >
                ← Dashboard
              </Link>
              <div className="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full text-xs">
                Beta Active
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Agent Selection & Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Selection */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">
                Choose Your Oracle Agent
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(agents).map(([key, agent]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedAgent(key as ElementalAgent)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedAgent === key
                        ? `${agent.bgColor} ${agent.borderColor} scale-105`
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-2xl mb-1">{agent.emoji}</div>
                    <div className="font-medium text-xs">{agent.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Oracle Input */}
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">
                    {agents[selectedAgent].emoji}
                  </span>
                  <h3 className="text-lg font-semibold">
                    {agents[selectedAgent].name}
                  </h3>
                  <div className="ml-auto">
                    <span className="bg-white/10 px-2 py-1 rounded text-xs">
                      Real Backend API
                    </span>
                  </div>
                </div>
                <p className="text-sm opacity-80">
                  {agents[selectedAgent].description}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Ask for guidance and wisdom
                  </label>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Share what's on your mind... your challenges, dreams, questions, or what guidance you're seeking..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !userInput.trim()}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${agents[selectedAgent].color} text-white`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Channeling {agents[selectedAgent].name}...
                    </div>
                  ) : (
                    `🔮 Consult ${agents[selectedAgent].name}`
                  )}
                </button>
              </form>
            </div>

            {/* Current Response */}
            {currentResponse && (
              <div
                className={`${agents[currentResponse.agent].bgColor} rounded-lg p-6 border ${agents[currentResponse.agent].borderColor}`}
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">
                    {agents[currentResponse.agent].emoji}
                  </span>
                  <h3 className="text-lg font-semibold">
                    {agents[currentResponse.agent].name} Responds
                  </h3>
                  <div className="ml-auto text-xs opacity-60">
                    {new Date(currentResponse.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="leading-relaxed">{currentResponse.message}</p>
                  </div>

                  {currentResponse.insight && (
                    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-yellow-400">
                        ✨ Key Insight
                      </h4>
                      <p className="text-sm">{currentResponse.insight}</p>
                    </div>
                  )}

                  {currentResponse.symbols &&
                    currentResponse.symbols.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-yellow-400">
                          🔮 Sacred Symbols
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentResponse.symbols.map((symbol, index) => (
                            <span
                              key={index}
                              className="bg-white/20 px-3 py-1 rounded-full text-xs"
                            >
                              {symbol}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Conversation History */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">
                Recent Conversations
              </h3>

              {conversations.length === 0 ? (
                <div className="text-center py-8 opacity-60">
                  <p className="text-sm">No conversations yet.</p>
                  <p className="text-xs mt-1">Start by asking a question!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-start mb-2">
                        <span className="text-lg mr-2">
                          {agents[conversation.response.agent].emoji}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {agents[conversation.response.agent].name}
                          </p>
                          <p className="text-xs opacity-60">
                            {new Date(
                              conversation.response.timestamp,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs mb-2 opacity-80">
                        <strong>You asked:</strong>{" "}
                        {conversation.userInput.slice(0, 100)}
                        {conversation.userInput.length > 100 && "..."}
                      </div>

                      <div className="text-xs opacity-80 mb-3">
                        <strong>Oracle said:</strong>{" "}
                        {conversation.response.message.slice(0, 150)}...
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() =>
                                handleRating(conversation.id, rating)
                              }
                              className={`text-sm transition ${
                                conversation.rating &&
                                conversation.rating >= rating
                                  ? "text-yellow-400"
                                  : "text-white/30 hover:text-white/60"
                              }`}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setShowFeedback(conversation.id)}
                          className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                        >
                          Feedback
                        </button>
                      </div>

                      {showFeedback === conversation.id && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Share your feedback about this oracle response..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-xs text-white placeholder-white/50 resize-none"
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => setShowFeedback(null)}
                              className="text-xs text-white/60 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleFeedback(conversation.id)}
                              className="text-xs bg-yellow-400 text-gray-900 px-3 py-1 rounded hover:bg-yellow-300"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      )}

                      {conversation.feedback && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-xs opacity-60">
                            <strong>Your feedback:</strong>{" "}
                            {conversation.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Beta Feedback */}
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-yellow-400">
                🚀 Beta Testing
              </h4>
              <p className="text-xs opacity-80 mb-3">
                Help us improve! Your feedback directly shapes the consciousness
                technology.
              </p>
              <Link
                href="/beta/feedback"
                className="text-xs bg-yellow-400 text-gray-900 px-3 py-1 rounded hover:bg-yellow-300 inline-block"
              >
                Send Feedback
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
