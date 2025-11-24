"use client";

import { useState } from "react";

interface Citation {
  fileName: string;
  pageNumber?: number;
  sectionTitle?: string;
  snippet: string;
  totalPages?: number;
  confidence: number;
  uploadDate?: string;
}

interface CitationBadgeProps {
  citation: Citation;
  className?: string;
}

export default function CitationBadge({ citation, className = "" }: CitationBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const confidenceStars = "★".repeat(Math.round(citation.confidence * 5)) + 
                         "☆".repeat(5 - Math.round(citation.confidence * 5));

  return (
    <div className={`mt-2 text-sm ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-amber-50 
                   hover:from-amber-100 hover:to-amber-100 border border-amber-200/50 
                   text-amber-800 hover:text-amber-900 transition-all duration-200 
                   shadow-sm hover:shadow-md"
      >
        <span className="text-amber-600 mr-1.5">📂</span>
        <span className="font-medium">{citation.fileName}</span>
        {citation.pageNumber && (
          <>
            <span className="text-amber-400 mx-1">·</span>
            <span className="text-amber-700">p.{citation.pageNumber}</span>
          </>
        )}
        {citation.sectionTitle && (
          <>
            <span className="text-amber-400 mx-1">·</span>
            <span className="text-amber-700 max-w-32 truncate">{citation.sectionTitle}</span>
          </>
        )}
        <span className="ml-2 text-xs text-amber-500">
          {expanded ? "▼" : "▶"}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-white to-amber-50/30 
                       shadow-lg border border-amber-100/50 backdrop-blur-sm">
          <div className="space-y-3">
            {/* Snippet Preview */}
            <div className="relative">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-400 rounded-full"></div>
              <blockquote className="pl-4 text-gray-700 italic leading-relaxed">
                "{citation.snippet}"
              </blockquote>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-100">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="text-amber-500 mr-1">✨</span>
                  Confidence: <span className="font-mono ml-1 text-amber-600">{confidenceStars}</span>
                </span>
                {citation.totalPages && (
                  <span className="flex items-center">
                    <span className="text-amber-500 mr-1">📄</span>
                    {citation.totalPages} pages
                  </span>
                )}
              </div>
              
              {citation.uploadDate && (
                <div className="text-xs text-gray-400">
                  <span className="text-amber-400 mr-1">📅</span>
                  {new Date(citation.uploadDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the Citation type for use in other components
export type { Citation };