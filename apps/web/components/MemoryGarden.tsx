"use client";

import { useState } from "react";
import { useMemorySystem } from "@/hooks/useMemorySystem";

interface Memory {
  id: string;
  type: 'journal' | 'voice' | 'upload';
  title?: string;
  content: string;
  preview?: string;
  createdAt: string;
  metadata?: {
    tags?: string[];
    audioUrl?: string;
  };
}

export default function MemoryGarden() {
  const { 
    memories, 
    isLoading, 
    filter: memoryFilter, 
    setFilter: setMemoryFilter,
    refresh: refreshMemories 
  } = useMemorySystem({ userId: 'web-user' });

  const getMemoryIcon = (type: string) => {
    switch(type) {
      case 'journal': return '💭';
      case 'voice': return '🎙️';
      case 'upload': return '📄';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <h2 className="font-sacred text-gold-divine text-xl">Memory Garden</h2>
        <div className="flex items-center gap-sm">
          <div className="text-sm text-neutral-mystic">
            {memories.length} memories
          </div>
          <button
            onClick={refreshMemories}
            className="p-xs hover:bg-gold-divine/10 rounded-subtle transition-colors"
            title="Refresh memories"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className={isLoading ? 'animate-spin text-gold-divine' : 'text-neutral-mystic'}>
              <path d="M4 10a6 6 0 0112 0M4 10a6 6 0 0012 0M4 10l2-2m-2 2l2 2m12-2l-2-2m2 2l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-xs bg-sacred-navy/30 backdrop-blur-sm rounded-sacred p-xs">
        {(['all', 'journal', 'voice', 'upload'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMemoryFilter(tab)}
            className={`
              flex-1 px-sm py-xs rounded-subtle text-sm transition-all
              ${memoryFilter === tab 
                ? 'bg-gold-divine text-sacred-cosmic' 
                : 'text-neutral-mystic hover:text-neutral-silver'
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Memory List */}
      <div className="space-y-sm">
        {isLoading ? (
          <div className="text-center py-lg">
            <div className="animate-spin text-gold-divine">✨</div>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-lg text-neutral-mystic">
            <p className="text-lg mb-sm">🌱</p>
            <p>Your memory garden awaits its first seeds...</p>
          </div>
        ) : (
          memories.map(memory => (
            <div
              key={memory.id}
              className="bg-sacred-navy/30 backdrop-blur-sm rounded-sacred p-md border border-gold-divine/10 hover:border-gold-divine/30 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-sm">
                <span className="text-xl" title={memory.type}>
                  {getMemoryIcon(memory.type)}
                </span>
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-pure mb-xs">
                    {memory.title || 'Untitled Memory'}
                  </h3>
                  <p className="text-sm text-neutral-silver line-clamp-2">
                    {memory.preview || memory.content}
                  </p>
                  <div className="flex items-center gap-sm mt-sm">
                    <time className="text-xs text-neutral-mystic">
                      {new Date(memory.createdAt).toLocaleDateString()}
                    </time>
                    {memory.metadata?.tags?.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-xs py-1 bg-sacred-ethereal/20 text-gold-amber rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Memory Button */}
      <button className="w-full py-sm rounded-sacred border border-dashed border-gold-divine/30 text-gold-divine hover:border-gold-divine hover:bg-gold-divine/10 transition-all">
        + Add Reflection
      </button>
    </div>
  );
}