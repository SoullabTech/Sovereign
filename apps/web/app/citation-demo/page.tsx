"use client";

import React from 'react';
import { ChatThread, ChatMessageData } from '@/components/chat/ChatMessage';

export default function CitationDemoPage() {
  // Sample chat messages with citations
  const sampleMessages: ChatMessageData[] = [
    {
      role: 'user',
      content: 'Can you tell me about the concept of flow states and how they relate to personal development?',
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
    {
      role: 'assistant',
      content: `Based on your research notes, flow states are fascinating psychological phenomena that occur when challenge perfectly meets skill level. In your research-notes.pdf (page 14, Chapter 2: The Psychology of Flow), you explored how flow represents the optimal experience where self-consciousness disappears and performance peaks.

Your personal-development.pdf also touches on this beautifully in the section "Mastery and Flow" (page 7), noting that flow states are essential for deep learning and personal transformation. The research suggests that cultivating flow requires both focused attention and a balance between challenge and capability.

What resonates most with your journey toward mastery, dear one?`,
      timestamp: new Date().toISOString(),
      audioUrl: '/sample-maya-voice.wav',
      citations: [
        {
          fileId: 'file-1',
          fileName: 'research-notes.pdf',
          category: 'Psychology',
          pageNumber: 14,
          sectionTitle: 'Chapter 2: The Psychology of Flow',
          sectionLevel: 1,
          preview: 'Flow states emerge when challenge meets skill at the optimal level. This psychological state is characterized by complete absorption in the activity, loss of self-consciousness, and enhanced performance. Csikszentmihalyi\'s research shows...',
          relevance: 0.95,
          chunkIndex: 1
        },
        {
          fileId: 'file-2', 
          fileName: 'personal-development.pdf',
          category: 'Self-Development',
          pageNumber: 7,
          sectionTitle: 'Mastery and Flow',
          sectionLevel: 2,
          preview: 'The cultivation of flow states is essential for deep learning and personal transformation. When we operate in flow, the boundaries between self and activity dissolve, leading to accelerated skill acquisition and profound insights...',
          relevance: 0.87,
          chunkIndex: 0
        }
      ],
      metadata: {
        element: 'aether',
        confidence: 0.92,
        sessionId: 'demo-session'
      }
    },
    {
      role: 'user',
      content: 'That\'s really helpful! How can I create more flow in my daily work?',
      timestamp: new Date(Date.now() + 10000).toISOString(),
    },
    {
      role: 'assistant',
      content: `Your notes offer some beautiful practical wisdom here, dear one. In your productivity-systems.pdf (page 3, "Creating Flow at Work"), you outlined several key strategies that align perfectly with what the research shows.

First, the concept of "challenge calibration" - actively adjusting task difficulty to match your current skill level. Your journal entries from March also mentioned how breaking complex projects into smaller, achievable milestones helped you enter flow more readily.

The deep work principles in your focus-techniques.pdf (page 12) emphasize the importance of eliminating distractions and creating sacred boundaries around your most important work.

Remember, flow isn't just about productivity - it's about aligning with your deeper purpose and finding joy in the process itself.`,
      timestamp: new Date(Date.now() + 30000).toISOString(),
      citations: [
        {
          fileId: 'file-3',
          fileName: 'productivity-systems.pdf',
          category: 'Productivity',
          pageNumber: 3,
          sectionTitle: 'Creating Flow at Work',
          sectionLevel: 2,
          preview: 'Challenge calibration involves actively adjusting the difficulty of tasks to match your current skill level. This dynamic balance prevents both boredom (when tasks are too easy) and anxiety (when they\'re too difficult)...',
          relevance: 0.91,
          chunkIndex: 2
        },
        {
          fileId: 'file-4',
          fileName: 'focus-techniques.pdf', 
          category: 'Productivity',
          pageNumber: 12,
          sectionTitle: 'Deep Work Principles',
          sectionLevel: 1,
          preview: 'Deep work requires the creation of sacred boundaries - both temporal and spatial - around your most cognitively demanding tasks. The research on attention residue shows that even small distractions can significantly impact...',
          relevance: 0.83,
          chunkIndex: 1
        },
        {
          fileId: 'file-5',
          fileName: 'march-journal.md',
          category: 'Personal',
          pageNumber: 1,
          sectionTitle: 'Weekly Reflections',
          sectionLevel: 2,
          preview: 'This week I noticed that breaking my big presentation project into smaller milestones really helped me get into flow. Instead of feeling overwhelmed by the whole thing, I could focus on just one section at a time...',
          relevance: 0.76,
          chunkIndex: 0
        }
      ],
      metadata: {
        element: 'earth',
        confidence: 0.88,
        sessionId: 'demo-session'
      }
    }
  ];

  const handlePlayAudio = (audioUrl: string) => {
    // In real implementation, this would trigger audio playback
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0D16] via-[#1A1F2E] to-[#2A2F3E]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Advanced Citation System
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            See how Maya naturally references your uploaded files with precise page numbers, 
            section titles, and expandable previews. This builds trust and helps you locate 
            original information quickly.
          </p>
        </div>

        {/* Demo Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1A1F2E]/50 border border-gold-divine/20 rounded-lg p-4">
            <h3 className="text-gold-divine font-semibold mb-2">📄 Page References</h3>
            <p className="text-gray-300 text-sm">
              Maya cites specific page numbers from PDFs and documents
            </p>
          </div>
          <div className="bg-[#1A1F2E]/50 border border-gold-divine/20 rounded-lg p-4">
            <h3 className="text-gold-divine font-semibold mb-2">📑 Section Context</h3>
            <p className="text-gray-300 text-sm">
              References include chapter titles and section headers
            </p>
          </div>
          <div className="bg-[#1A1F2E]/50 border border-gold-divine/20 rounded-lg p-4">
            <h3 className="text-gold-divine font-semibold mb-2">🔍 Preview Snippets</h3>
            <p className="text-gray-300 text-sm">
              Expandable badges show relevant text excerpts
            </p>
          </div>
        </div>

        {/* Chat Demo */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0A0D16]/80 border border-gold-divine/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gold-divine/10">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-white font-medium">Live Citation Demo</span>
              <span className="text-xs text-gray-400 ml-auto">
                Maya • Aether Mode
              </span>
            </div>
            
            <ChatThread 
              messages={sampleMessages}
              onPlayAudio={handlePlayAudio}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-gold-divine/10 border border-gold-divine/20 rounded-lg p-4 max-w-lg">
            <h3 className="text-gold-divine font-semibold mb-2">Try It Yourself</h3>
            <p className="text-gray-300 text-sm">
              Click the citation badges to expand them and see detailed source information. 
              In the full system, these would link back to your uploaded files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}