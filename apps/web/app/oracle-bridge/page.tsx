"use client";

import { useState, useEffect } from "react";
import HoloflowerViz from "@/components/HoloflowerViz";
import SessionHistory, { Session } from "@/components/SessionHistory";
import ElementalArc from "@/components/ElementalArc";

interface InsightResponse {
  sessionId: string;
  timestamp: string;
  userCheckin?: Array<{
    petal: string;
    essence: string;
    keywords: string[];
    feeling: string;
    ritual: string;
  }>;
  oracleReading?: {
    elementalBalance: Record<string, number>;
    spiralStage: { element: string; stage: number };
    reflection: string;
    practice: string;
    archetype: string;
  };
  mergedInsight?: {
    alignment: string;
    tension: string;
    synthesis: string;
  };
}

export default function OracleBridgePage() {
  const [journalText, setJournalText] = useState("");
  const [petalValues, setPetalValues] = useState<Record<string, number>>({});
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);

  const handleSubmit = async () => {
    if (!journalText && Object.keys(petalValues).length === 0) return;

    setLoading(true);
    try {
      // Filter petals with value > 0.3 for check-in
      const significantPetals = Object.entries(petalValues)
        .filter(([_, value]) => value > 0.3)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: journalText || undefined,
          userCheckin: Object.keys(significantPetals).length > 0 ? significantPetals : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data);
        
        // Add to session history
        const newSession: Session = {
          id: data.sessionId,
          timestamp: data.timestamp,
          checkin: significantPetals,
          oracleReading: data.oracleReading,
          mergedInsight: data.mergedInsight,
          isBreakthrough: data.mergedInsight?.synthesis?.includes("breakthrough") || false
        };
        setSessionHistory(prev => [...prev, newSession]);
      }
    } catch (error) {
      console.error("Failed to get insights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
          Oracle Bridge
        </h1>
        <p className="text-center text-gray-400 mb-8">Where intuition meets insight</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Intuitive Check-in */}
          <div className="bg-black/30 backdrop-blur rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              🌸 Right Brain • Divination
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Drag the petals outward to express your current state
            </p>
            
            <div className="flex justify-center">
              <HoloflowerViz
                onPetalChange={setPetalValues}
                oracleWedge={insights?.oracleReading?.spiralStage as any}
                mergedSynthesis={insights?.mergedInsight?.synthesis}
                width={500}
                height={500}
              />
            </div>

            {/* Show user check-in results */}
            {insights?.userCheckin && insights.userCheckin.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-lg font-medium text-amber-200">Your Energy Signatures:</h3>
                {insights.userCheckin.map((item, idx) => (
                  <div key={idx} className="bg-amber-900/30 rounded-lg p-3">
                    <div className="font-medium text-amber-100">{item.essence}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.keywords.join(" • ")}
                    </div>
                    <div className="text-sm text-amber-200 mt-2 italic">
                      "{item.feeling}"
                    </div>
                    <div className="text-sm text-yellow-400 mt-2">
                      💫 Ritual: {item.ritual}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Oracle Reading */}
          <div className="bg-black/30 backdrop-blur rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">
              🧠 Left Brain • Oracle
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Share your thoughts for deeper analysis
            </p>

            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="What's on your mind? What are you navigating?"
              className="w-full h-40 bg-black/50 border border-amber-500/30 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />

            <button
              onClick={handleSubmit}
              disabled={loading || (!journalText && Object.keys(petalValues).length === 0)}
              className="w-full mt-4 bg-gradient-to-r from-amber-600 to-blue-600 hover:from-amber-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 px-6 font-medium transition-all"
            >
              {loading ? "Processing..." : "Receive Insight"}
            </button>

            {/* Show oracle results */}
            {insights?.oracleReading && (
              <div className="mt-6 space-y-4">
                <div className="bg-blue-900/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-200 mb-2">Oracle Reading</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-400">Reflection:</div>
                      <div className="text-blue-100">{insights.oracleReading.reflection}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">Practice:</div>
                      <div className="text-yellow-300">{insights.oracleReading.practice}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">Archetype:</div>
                      <div className="text-amber-300 font-medium">
                        {insights.oracleReading.archetype}
                      </div>
                    </div>

                    {/* Special Aether indicator */}
                    {insights.oracleReading.spiralStage?.element === "aether" && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-amber-900/40 to-blue-900/40 rounded-lg border border-white/20">
                        <div className="text-sm text-gray-300 mb-1">✨ Transcendent State Detected</div>
                        <div className="text-white font-medium">
                          Aether Stage {insights.oracleReading.spiralStage.stage}:
                          {insights.oracleReading.spiralStage.stage === 1 && " Expansive - Vastness Meeting"}
                          {insights.oracleReading.spiralStage.stage === 2 && " Contractive - Witnessing Pause"}
                          {insights.oracleReading.spiralStage.stage === 3 && " Stillness - Perfect Balance"}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-gray-400 mb-2">Elemental Balance:</div>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(insights.oracleReading.elementalBalance).map(([element, value]) => (
                          <div key={element} className="text-center">
                            <div className="text-xs capitalize">{element}</div>
                            <div className="h-20 bg-black/50 rounded relative overflow-hidden">
                              <div 
                                className={`absolute bottom-0 w-full transition-all ${
                                  element === "fire" ? "bg-red-500" :
                                  element === "water" ? "bg-blue-500" :
                                  element === "earth" ? "bg-green-600" :
                                  element === "air" ? "bg-gray-400" :
                                  "bg-amber-500"
                                }`}
                                style={{ height: `${value * 100}%` }}
                              />
                            </div>
                            <div className="text-xs mt-1">{Math.round(value * 100)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Bridge - Synthesis */}
        {insights?.mergedInsight && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-amber-900/50 to-blue-900/50 backdrop-blur rounded-xl p-6 border border-yellow-500/30">
              <h3 className="text-xl font-semibold text-center mb-4 text-yellow-400">
                🌉 The Bridge
              </h3>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-light italic text-yellow-100 mb-4">
                    "{insights.mergedInsight.synthesis}"
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-900/30 rounded-lg p-3">
                    <div className="text-green-400 font-medium mb-1">✨ Alignment</div>
                    <div className="text-gray-300">{insights.mergedInsight.alignment}</div>
                  </div>
                  
                  <div className="bg-red-900/30 rounded-lg p-3">
                    <div className="text-red-400 font-medium mb-1">⚡ Creative Tension</div>
                    <div className="text-gray-300">{insights.mergedInsight.tension}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Journey Tracking Section */}
        {sessionHistory.length > 0 && (
          <div className="mt-12 space-y-8">
            <div className="border-t border-amber-500/20 pt-8">
              <h2 className="text-2xl font-semibold text-center mb-8 bg-gradient-to-r from-amber-400 to-blue-400 bg-clip-text text-transparent">
                Your Journey Arc
              </h2>
              
              {/* Session Timeline */}
              <div className="bg-black/30 backdrop-blur rounded-xl p-6">
                <SessionHistory 
                  sessions={sessionHistory}
                  view="horizontal"
                  onSessionClick={(session) => {
                    console.log("Session clicked:", session);
                  }}
                />
              </div>

              {/* Elemental Arc Visualization */}
              <div className="mt-6">
                <ElementalArc sessions={sessionHistory} height={250} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}