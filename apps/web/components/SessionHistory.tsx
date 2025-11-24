"use client";

import React, { useState } from "react";
import MiniHoloflower from "./MiniHoloflower";

export interface Session {
  id: string;
  timestamp: string;
  checkin?: Record<string, number>;
  oracleReading?: {
    spiralStage?: {
      element: "fire" | "water" | "earth" | "air" | "aether";
      stage: 1 | 2 | 3;
    };
    reflection?: string;
    archetype?: string;
  };
  mergedInsight?: {
    synthesis?: string;
    alignment?: string;
    tension?: string;
  };
  isBreakthrough?: boolean; // Mark integration moments
}

interface SessionHistoryProps {
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
  view?: "horizontal" | "vertical" | "grid";
}

export default function SessionHistory({
  sessions,
  onSessionClick,
  view = "horizontal"
}: SessionHistoryProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [filter, setFilter] = useState<"all" | "fire" | "water" | "earth" | "air" | "aether">("all");

  // Filter sessions by element
  const filteredSessions = sessions.filter(s => {
    if (filter === "all") return true;
    return s.oracleReading?.spiralStage?.element === filter;
  });

  // Calculate elemental frequency
  const elementCounts = sessions.reduce((acc, s) => {
    const element = s.oracleReading?.spiralStage?.element || "unknown";
    acc[element] = (acc[element] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    onSessionClick?.(session);
  };

  return (
    <div className="w-full">
      {/* Filter Controls */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Filter by element:</span>
        <div className="flex gap-1">
          {["all", "fire", "water", "earth", "air", "aether"].map(elem => (
            <button
              key={elem}
              onClick={() => setFilter(elem as any)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                filter === elem 
                  ? "bg-amber-600 text-white" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {elem === "all" ? "All" : (
                <>
                  {elem === "fire" && "🔥"}
                  {elem === "water" && "💧"}
                  {elem === "earth" && "🌍"}
                  {elem === "air" && "🌬️"}
                  {elem === "aether" && "✨"}
                  {" "}{elem}
                  <span className="ml-1 opacity-60">({elementCounts[elem] || 0})</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      <div className={`
        ${view === "horizontal" ? "flex gap-4 overflow-x-auto pb-6" : ""}
        ${view === "vertical" ? "flex flex-col gap-4" : ""}
        ${view === "grid" ? "grid grid-cols-6 gap-4" : ""}
        scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-purple-600
      `}>
        {filteredSessions.map((session, idx) => (
          <div key={session.id} className="relative">
            {/* Connection line (for horizontal view) */}
            {view === "horizontal" && idx < filteredSessions.length - 1 && (
              <div className="absolute top-10 left-20 w-8 h-0.5 bg-gradient-to-r from-amber-600 to-transparent" />
            )}
            
            {/* Mini Holoflower */}
            <MiniHoloflower
              checkin={session.checkin}
              oracle={session.oracleReading?.spiralStage}
              timestamp={session.timestamp}
              synthesis={session.mergedInsight?.synthesis}
              isHighlight={session.isBreakthrough}
              onClick={() => handleSessionClick(session)}
            />

            {/* Session number */}
            <div className="text-center mt-1 text-xs text-gray-600">
              #{idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Elemental Arc Summary */}
      <div className="mt-6 p-4 bg-black/30 rounded-lg">
        <h3 className="text-sm font-medium text-amber-300 mb-3">Elemental Journey Arc</h3>
        <div className="flex items-center gap-4">
          {["fire", "water", "earth", "air", "aether"].map(elem => {
            const count = elementCounts[elem] || 0;
            const percentage = sessions.length > 0 ? (count / sessions.length) * 100 : 0;
            
            return (
              <div key={elem} className="flex-1">
                <div className="text-xs text-gray-400 mb-1 text-center capitalize">{elem}</div>
                <div className="h-24 bg-gray-800 rounded relative">
                  <div 
                    className={`absolute bottom-0 w-full rounded transition-all ${
                      elem === "fire" ? "bg-red-500" :
                      elem === "water" ? "bg-blue-500" :
                      elem === "earth" ? "bg-green-600" :
                      elem === "air" ? "bg-gray-400" :
                      "bg-gradient-to-t from-amber-400 to-transparent"
                    }`}
                    style={{ height: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-center mt-1 text-gray-500">
                  {count} ({Math.round(percentage)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8" 
             onClick={() => setSelectedSession(null)}>
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-amber-300">Session Detail</h2>
                <p className="text-sm text-gray-400">
                  {new Date(selectedSession.timestamp).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Oracle Reading */}
            {selectedSession.oracleReading && (
              <div className="mb-4 p-4 bg-blue-900/20 rounded-lg">
                <h3 className="text-sm font-medium text-blue-300 mb-2">Oracle Reading</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Element: </span>
                    <span className="text-white capitalize">
                      {selectedSession.oracleReading.spiralStage?.element} 
                      {" Stage "}{selectedSession.oracleReading.spiralStage?.stage}
                    </span>
                  </div>
                  {selectedSession.oracleReading.archetype && (
                    <div>
                      <span className="text-gray-400">Archetype: </span>
                      <span className="text-amber-300">{selectedSession.oracleReading.archetype}</span>
                    </div>
                  )}
                  {selectedSession.oracleReading.reflection && (
                    <div className="mt-2 text-blue-100 italic">
                      "{selectedSession.oracleReading.reflection}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Merged Insight */}
            {selectedSession.mergedInsight && (
              <div className="p-4 bg-gradient-to-r from-amber-900/30 to-blue-900/30 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-400 mb-2">Synthesis</h3>
                <div className="space-y-3 text-sm">
                  {selectedSession.mergedInsight.synthesis && (
                    <div className="text-yellow-100 text-base italic">
                      "{selectedSession.mergedInsight.synthesis}"
                    </div>
                  )}
                  {selectedSession.mergedInsight.alignment && (
                    <div>
                      <span className="text-green-400">Alignment: </span>
                      <span className="text-gray-300">{selectedSession.mergedInsight.alignment}</span>
                    </div>
                  )}
                  {selectedSession.mergedInsight.tension && (
                    <div>
                      <span className="text-red-400">Tension: </span>
                      <span className="text-gray-300">{selectedSession.mergedInsight.tension}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}