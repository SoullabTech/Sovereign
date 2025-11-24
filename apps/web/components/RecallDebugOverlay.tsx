"use client";
import React from "react";
import { X, Brain, CheckCircle, AlertTriangle } from "lucide-react";

interface RecallDebugOverlayProps {
  memories: {
    id: string;
    content: string;
    similarity: number;
    element?: string;
    phase?: string;
    injected: boolean;
  }[];
  visible: boolean;
  onClose: () => void;
}

export default function RecallDebugOverlay({
  memories,
  visible,
  onClose,
}: RecallDebugOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-black/90 backdrop-blur-sm text-white rounded-xl shadow-2xl p-4 z-50 border border-amber-500/50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-400 animate-pulse" /> 
          Semantic Recall Debug
        </h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {memories.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-4">
            No memories retrieved for this query
          </p>
        )}
        
        {memories.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg border transition-all ${
              m.injected 
                ? "bg-amber-900/30 border-amber-500/30" 
                : "bg-gray-800/30 border-gray-600/30"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <span className="font-semibold text-sm">
                  {m.element && (
                    <span className="text-amber-300">{m.element}</span>
                  )}
                  {m.element && m.phase && " · "}
                  {m.phase && (
                    <span className="text-gray-300">{m.phase}</span>
                  )}
                  {!m.element && !m.phase && (
                    <span className="text-gray-500">General Memory</span>
                  )}
                </span>
              </div>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                  m.similarity > 0.85
                    ? "bg-green-500/20 text-green-400"
                    : m.similarity > 0.75
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {Math.round(m.similarity * 100)}%
              </span>
            </div>
            
            <p className="text-xs text-gray-300 line-clamp-2 mb-2">
              "{m.content}"
            </p>
            
            <div className="flex items-center justify-between">
              {m.injected ? (
                <div className="flex items-center gap-1 text-green-400 text-xs">
                  <CheckCircle className="w-3 h-3" /> 
                  <span>Injected into context</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-500 text-xs">
                  <AlertTriangle className="w-3 h-3" /> 
                  <span>Retrieved but filtered</span>
                </div>
              )}
              <span className="text-xs text-gray-500">
                ID: {m.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {memories.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Total Retrieved: {memories.length}</span>
            <span>Injected: {memories.filter(m => m.injected).length}</span>
          </div>
        </div>
      )}
    </div>
  );
}