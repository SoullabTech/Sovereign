'use client';

/**
 * MaiaRightPanelHost — Contextual side panel
 *
 * Shows world-specific content on the right side.
 * Pass B: real panel content for Patterns, Journal, Wisdom.
 * Other worlds still show placeholders.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getPanelForWorld } from '@/lib/navigation/maiaNav';
import type { MaiaWorldId } from '@/lib/navigation/types';
import { PatternsPanel } from './panels/PatternsPanel';
import { JournalPanel } from './panels/JournalPanel';
import { WisdomPanel } from './panels/WisdomPanel';
import { IdeasPanel } from './panels/IdeasPanel';
import { RelationshipsPanel } from './panels/RelationshipsPanel';
import { ConversationInsightPanel } from './panels/ConversationInsightPanel';
import type { ConversationInsight } from '@/lib/maia/cognitionEvents';

interface MaiaRightPanelHostProps {
  isOpen: boolean;
  activeWorld: MaiaWorldId;
  explorerId: string;
  /** Cognition insights to show at top of panel */
  insights: ConversationInsight[];
  onClose: () => void;
  onOpenJournalSheet: () => void;
  onOpenShadowWork: () => void;
  onOpenAcademy: () => void;
  onOpenChanges: () => void;
  onChooseGuide: () => void;
  onShowCurrentElder: () => void;
}

export function MaiaRightPanelHost({
  isOpen,
  activeWorld,
  explorerId,
  insights,
  onClose,
  onOpenJournalSheet,
  onOpenShadowWork,
  onOpenAcademy,
  onOpenChanges,
  onChooseGuide,
  onShowCurrentElder,
}: MaiaRightPanelHostProps) {
  const panelConfig = getPanelForWorld(activeWorld);

  function renderPanelContent() {
    switch (activeWorld) {
      case 'patterns':
        return <PatternsPanel explorerId={explorerId} />;
      case 'journal':
        return (
          <JournalPanel
            explorerId={explorerId}
            onOpenJournalSheet={onOpenJournalSheet}
            onOpenShadowWork={onOpenShadowWork}
          />
        );
      case 'wisdom':
        return (
          <WisdomPanel
            explorerId={explorerId}
            onOpenAcademy={onOpenAcademy}
            onChooseGuide={onChooseGuide}
            onShowCurrentElder={onShowCurrentElder}
          />
        );
      case 'ideas':
        return <IdeasPanel explorerId={explorerId} />;
      case 'relationships':
        return <RelationshipsPanel explorerId={explorerId} />;
      default:
        return null;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-12 bottom-0 w-80 bg-[#0f0d0b]/95 backdrop-blur-xl border-l border-[#3a2a1f]/40 z-[60] flex flex-col"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a2a1f]/30">
            <span className="text-sm font-light text-[#D4B896]/80 tracking-wide">
              {panelConfig?.label || 'Context'}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-500 hover:text-[#D4B896]/70 hover:bg-[#D4B896]/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Cognition insights — visible edge of MAIA's awareness */}
            {insights.length > 0 && (
              <div className="mb-4 pb-3 border-b border-[#3a2a1f]/20">
                <ConversationInsightPanel insights={insights} />
              </div>
            )}
            {renderPanelContent()}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
