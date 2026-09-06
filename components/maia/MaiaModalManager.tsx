'use client';

/**
 * MaiaModalManager — Hosts ALL transient overlays for the spatial shell
 *
 * Pass B: absorbs all sheets from page.tsx inline rendering.
 * Single location for all modal/sheet visibility and rendering.
 */

import { VoiceHelpSheet, TestFlightHelpSheet, HelpHubSheet } from '@/components/help';
import FeedbackSheet from '@/components/feedback/FeedbackSheet';
import PasswordChangeSheet from '@/components/auth/PasswordChangeSheet';
import { FrameworkSelector } from '@/components/framework/FrameworkSelector';
import { QuickJournalSheet } from '@/components/journal/QuickJournalSheet';
import { ShadowFieldSheet } from '@/components/maia/shadowField/ShadowFieldSheet';
import { AcademySheet } from '@/components/academy/AcademySheet';
import { ChangesSheet } from '@/components/maia/changes/ChangesSheet';

interface MaiaModalManagerProps {
  explorerId: string;
  explorerName: string;

  // Help modals
  showHelpHub: boolean;
  onCloseHelpHub: () => void;
  showVoiceHelp: boolean;
  onCloseVoiceHelp: () => void;
  showTestFlightHelp: boolean;
  onCloseTestFlightHelp: () => void;
  onOpenVoiceHelp: () => void;
  onOpenTestFlightHelp: () => void;

  // Feedback
  showFeedbackSheet: boolean;
  onCloseFeedbackSheet: () => void;

  // Password change
  showPasswordChangeModal: boolean;
  onClosePasswordChangeModal: () => void;

  // Framework selector
  showFrameworkSelector: boolean;
  onCloseFrameworkSelector: () => void;
  frameworkSelectorMode: 'counsel' | 'scribe';

  // Journal
  showJournalSheet: boolean;
  onCloseJournalSheet: () => void;
  onJournalAskMaia?: (content: string, type: string) => void;

  // Shadow Work
  showShadowWork: boolean;
  onCloseShadowWork: () => void;

  // Academy
  showAcademySheet: boolean;
  onCloseAcademySheet: () => void;

  // Changes (Book of Changes)
  showChangesSheet: boolean;
  onCloseChangesSheet: () => void;
}

export function MaiaModalManager({
  explorerId,
  explorerName,
  showHelpHub,
  onCloseHelpHub,
  showVoiceHelp,
  onCloseVoiceHelp,
  showTestFlightHelp,
  onCloseTestFlightHelp,
  onOpenVoiceHelp,
  onOpenTestFlightHelp,
  showFeedbackSheet,
  onCloseFeedbackSheet,
  showPasswordChangeModal,
  onClosePasswordChangeModal,
  showFrameworkSelector,
  onCloseFrameworkSelector,
  frameworkSelectorMode,
  showJournalSheet,
  onCloseJournalSheet,
  onJournalAskMaia,
  showShadowWork,
  onCloseShadowWork,
  showAcademySheet,
  onCloseAcademySheet,
  showChangesSheet,
  onCloseChangesSheet,
}: MaiaModalManagerProps) {
  return (
    <>
      {/* --- Help group ---
       * HelpHubSheet is a member orientation surface and does not expose
       * admin/QA tooling. TestFlightHelpSheet remains mounted so it can be
       * reached from Beta Center / admin surfaces; the trigger pathway
       * (showTestFlightHelp + onOpenTestFlightHelp) is preserved for that
       * future wiring. See: project_surface_typology.md
       */}
      <HelpHubSheet
        isOpen={showHelpHub}
        onClose={onCloseHelpHub}
        onOpenVoiceHelp={onOpenVoiceHelp}
      />
      <VoiceHelpSheet isOpen={showVoiceHelp} onClose={onCloseVoiceHelp} />
      <TestFlightHelpSheet isOpen={showTestFlightHelp} onClose={onCloseTestFlightHelp} />

      {/* --- Feedback & auth --- */}
      <FeedbackSheet
        isOpen={showFeedbackSheet}
        onClose={onCloseFeedbackSheet}
        userName={explorerName}
        userId={explorerId}
      />
      <PasswordChangeSheet
        isOpen={showPasswordChangeModal}
        onClose={onClosePasswordChangeModal}
        memberId={explorerId}
        memberName={explorerName}
      />

      {/* --- Framework selector --- */}
      <FrameworkSelector
        mode={frameworkSelectorMode}
        isOpen={showFrameworkSelector}
        onClose={onCloseFrameworkSelector}
      />

      {/* --- Content sheets (migrated from page.tsx inline) --- */}
      <QuickJournalSheet
        isOpen={showJournalSheet}
        onClose={onCloseJournalSheet}
        userId={explorerId}
        onSaved={() => {}}
        onAskMaia={onJournalAskMaia ? (content, type) => onJournalAskMaia(content, type) : undefined}
      />
      <ShadowFieldSheet
        isOpen={showShadowWork}
        onClose={onCloseShadowWork}
        userId={explorerId}
        onComplete={() => {}}
      />
      <AcademySheet
        isOpen={showAcademySheet}
        onClose={onCloseAcademySheet}
        userId={explorerId}
        onSelectPrompt={() => {}}
      />
      <ChangesSheet
        isOpen={showChangesSheet}
        onClose={onCloseChangesSheet}
        memberId={explorerId}
        memberName={explorerName}
      />
    </>
  );
}
