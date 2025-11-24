'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMaiaStore } from '@/lib/maia/state';

import ModeSelection from '@/components/maia/ModeSelection';
import JournalEntry from '@/components/maia/JournalEntry';
import VoiceJournaling from '@/components/maia/VoiceJournaling';
import MaiaReflection from '@/components/maia/MaiaReflection';
import TimelineView from '@/components/maia/TimelineView';
import SemanticSearch from '@/components/maia/SemanticSearch';
import OracleConversation from '@/components/OracleConversation';

export function MAIAMainContent() {
  const { currentView, isVoiceMode } = useMaiaStore();

  const renderView = () => {
    console.log('🎯 [RENDER VIEW] Switching on currentView:', currentView, 'isVoiceMode:', isVoiceMode);
    switch (currentView) {
      case 'mode-select':
        console.log('🎯 [RENDER VIEW] Rendering ModeSelection');
        return <ModeSelection />;
      case 'journal-entry':
        console.log('🎯 [RENDER VIEW] Rendering JournalEntry');
        return <JournalEntry />;
      case 'voice-journal':
        console.log('🎯 [RENDER VIEW] Rendering VoiceJournaling');
        return <VoiceJournaling />;
      case 'reflection':
        console.log('🎯 [RENDER VIEW] Rendering MaiaReflection');
        return <MaiaReflection />;
      case 'timeline':
        console.log('🎯 [RENDER VIEW] Rendering TimelineView');
        return <TimelineView />;
      case 'search':
        console.log('🎯 [RENDER VIEW] Rendering SemanticSearch');
        return <SemanticSearch />;
      case 'oracle-conversation':
        console.log('🎯 [RENDER VIEW] Rendering OracleConversation');
        return <OracleConversation onOpenLabTools={() => console.log('LabTools requested')} />;
      default:
        console.log('🎯 [RENDER VIEW] Default case - rendering ModeSelection');
        return <ModeSelection />;
    }
  };

  return (
    <main className="py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}