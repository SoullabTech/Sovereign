/**
 * ConversationModeSwitcher - Three-mode toggle for MAIA conversations
 * Modes: Dialogue (Samantha), Counsel (Deep Listening), Scribe (Session Witnessing)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Ear, BookOpen } from 'lucide-react';

type ConversationMode = 'normal' | 'patient' | 'session';

interface ConversationModeSwitcherProps {
  mode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
  isConnected?: boolean;
}

const modeConfig = {
  normal: {
    icon: MessageCircle,
    label: 'Dialogue',
    description: 'Back & forth conversation',
    color: '#d4b896', // Sacred gold
    bgGradient: 'linear-gradient(135deg, rgba(212,184,150,0.3), rgba(212,184,150,0.2))',
  },
  patient: {
    icon: Ear,
    label: 'Counsel',
    description: 'Deep listening mode',
    color: '#9370DB', // Medium purple - spacious, receptive
    bgGradient: 'linear-gradient(135deg, rgba(147,112,219,0.3), rgba(147,112,219,0.2))',
  },
  session: {
    icon: BookOpen,
    label: 'Scribe',
    description: 'Witness full session',
    color: '#4682B4', // Steel blue - wise, witnessing
    bgGradient: 'linear-gradient(135deg, rgba(70,130,180,0.3), rgba(70,130,180,0.2))',
  },
};

export const ConversationModeSwitcher: React.FC<ConversationModeSwitcherProps> = ({
  mode,
  onModeChange,
  isConnected = true,
}) => {
  // HIDDEN - Mode switcher now controlled from top navigation bar in page.tsx header
  return null;
};
