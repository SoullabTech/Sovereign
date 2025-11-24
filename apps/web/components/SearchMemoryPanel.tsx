"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

interface SearchMemoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  mockMode?: boolean;
}

interface SearchResult {
  id: string;
  type: "journal" | "conversation" | "element";
  title: string;
  snippet: string;
  tags?: string[];
  date?: string;
}

const mockResults: SearchResult[] = [
  {
    id: "1",
    type: "journal",
    title: "Grounding Practice",
    snippet: "Today I felt really stressed and used breathing to ground.",
    tags: ["🌍 Earth", "Challenge"],
    date: "2025-09-01",
  },
  {
    id: "2",
    type: "conversation",
    title: "Maya Session",
    snippet: "Maya helped me cool down from fire energy into water calmness.",
    tags: ["🔥 Fire", "🌊 Water"],
    date: "2025-09-02",
  },
  {
    id: "3",
    type: "element",
    title: "Elemental Insight",
    snippet: "You&apos;ve been working with air energy across 3 sessions.",
    tags: ["💨 Air"],
    date: "2025-09-03",
  },
];

export default function SearchMemoryPanel({
  isOpen,
  onClose,
  userId,
  mockMode = true,
}: SearchMemoryPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(mockResults);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mockMode) {
      const filtered = mockResults.filter((r) =>
        r.snippet.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      // TODO: Replace with Supabase search API
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed top-0 right-0 w-96 h-full bg-[#0A0D16] border-l border-gray-700 z-50 shadow-xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">🔍 Search & Memory</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex items-center p-3 border-b border-gray-700">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search journals, conversations..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none px-2"
            />
            <button type="submit" className="text-gray-400 hover:text-white">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {results.length === 0 && (
              <p className="text-gray-400 text-sm">No results found.</p>
            )}
            {results.map((r) => (
              <div
                key={r.id}
                className="p-3 bg-[#1A1D29] rounded-xl shadow hover:bg-[#232737] cursor-pointer transition"
              >
                <p className="text-sm text-gray-400 uppercase mb-1">{r.type}</p>
                <h3 className="text-white font-semibold">{r.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{r.snippet}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {r.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-[#2A2E3F] text-gray-300 px-2 py-1 text-xs rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {r.date && (
                  <p className="text-xs text-gray-500 mt-1">{r.date}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}