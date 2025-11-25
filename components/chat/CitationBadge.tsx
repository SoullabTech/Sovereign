"use client";

import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export interface CitationData {
  fileId: string;
  fileName: string;
  category?: string;
  pageNumber?: number;
  sectionTitle?: string;
  sectionLevel?: number;
  preview: string;
  relevance: number;
  chunkIndex: number;
}

interface CitationBadgeProps {
  citation: CitationData;
  index: number;
  onClick?: () => void;
  className?: string;
}

export function CitationBadge({ citation, index, onClick, className = '' }: CitationBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatFileName = (fileName: string) => {
    // Remove extension and truncate if too long
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    return nameWithoutExt.length > 20 
      ? nameWithoutExt.substring(0, 20) + '...' 
      : nameWithoutExt;
  };

  const formatPageSection = () => {
    let parts = [];
    if (citation.pageNumber) {
      parts.push(`p.${citation.pageNumber}`);
    }
    if (citation.sectionTitle) {
      const shortTitle = citation.sectionTitle.length > 30 
        ? citation.sectionTitle.substring(0, 30) + '...' 
        : citation.sectionTitle;
      parts.push(shortTitle);
    }
    return parts.join(' · ');
  };

  const relevancePercent = Math.round(citation.relevance * 100);
  const relevanceColor = relevancePercent >= 80 
    ? 'text-green-400' 
    : relevancePercent >= 60 
    ? 'text-yellow-400' 
    : 'text-gray-400';

  return (
    <div className={`inline-block ${className}`}>
      {/* Main Citation Badge */}
      <div 
        className="inline-flex items-center gap-1 px-2 py-1 bg-gold-divine/10 border border-gold-divine/20 rounded-lg cursor-pointer hover:bg-gold-divine/20 transition-colors text-xs"
        onClick={() => {
          setIsExpanded(!isExpanded);
          onClick?.();
        }}
      >
        <FileText className="w-3 h-3 text-gold-divine" />
        <span className="text-gold-divine font-medium">
          {formatFileName(citation.fileName)}
        </span>
        {formatPageSection() && (
          <>
            <span className="text-gold-amber/60">·</span>
            <span className="text-gold-amber/80">
              {formatPageSection()}
            </span>
          </>
        )}
        <span className={`text-xs ${relevanceColor}`}>
          {relevancePercent}%
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-gold-amber" />
        ) : (
          <ChevronDown className="w-3 h-3 text-gold-amber" />
        )}
      </div>

      {/* Expanded Preview */}
      {isExpanded && (
        <div className="mt-2 p-3 bg-[#0A0D16]/90 border border-gold-divine/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold-divine" />
              <span className="text-white font-medium text-sm">
                {citation.fileName}
              </span>
              {citation.category && (
                <span className="px-2 py-1 bg-gold-divine/10 text-gold-amber text-xs rounded">
                  {citation.category}
                </span>
              )}
            </div>
            <span className={`text-xs ${relevanceColor}`}>
              {relevancePercent}% match
            </span>
          </div>
          
          {(citation.pageNumber || citation.sectionTitle) && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gold-amber/80">
              {citation.pageNumber && (
                <span>Page {citation.pageNumber}</span>
              )}
              {citation.pageNumber && citation.sectionTitle && (
                <span>·</span>
              )}
              {citation.sectionTitle && (
                <span className="italic">"{citation.sectionTitle}"</span>
              )}
            </div>
          )}
          
          <div className="text-xs text-gray-300 leading-relaxed">
            <span className="font-medium text-gold-divine">Preview:</span>
            <div className="mt-1 pl-2 border-l-2 border-gold-divine/20">
              {citation.preview}
              {citation.preview.length >= 190 && '...'}
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gold-divine/10">
            <button 
              onClick={() => {
                // TODO: Open full file viewer or jump to page
              }}
              className="text-xs text-gold-divine hover:text-gold-amber transition-colors"
            >
              View in library →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CitationListProps {
  citations: CitationData[];
  className?: string;
}

export function CitationList({ citations, className = '' }: CitationListProps) {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 mt-2 ${className}`}>
      {citations.map((citation, index) => (
        <CitationBadge 
          key={`${citation.fileId}-${citation.chunkIndex}`}
          citation={citation}
          index={index}
        />
      ))}
    </div>
  );
}