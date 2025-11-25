'use client';

import React, { forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { ContinuousConversation, ContinuousConversationRef, ContinuousConversationProps } from './ContinuousConversation';
import { toast } from 'react-hot-toast';

interface VoiceWithNotesProps extends ContinuousConversationProps {
  onNoteDetected?: (text: string, type: 'previous' | 'next') => Promise<void>;
  conversationId?: string;
}

export interface VoiceWithNotesRef extends ContinuousConversationRef {
  saveLastMessage: () => Promise<void>;
}

// Enhanced voice component with note-taking capability
export const VoiceWithNotes = forwardRef<VoiceWithNotesRef, VoiceWithNotesProps>((props, ref) => {
  const {
    onTranscript,
    onNoteDetected,
    conversationId,
    ...restProps
  } = props;

  const voiceRef = useRef<ContinuousConversationRef>(null);
  const lastTranscriptRef = useRef<string>('');
  const lastMaiaMessageRef = useRef<string>('');
  const isWaitingForNoteRef = useRef<boolean>(false);

  // Detect note intent from transcript
  const detectNoteIntent = (transcript: string): { hasIntent: boolean; type: 'previous' | 'next' | null } => {
    const lower = transcript.toLowerCase();

    const savePreviousPhrases = [
      'note that',
      'save that',
      'make a note of that',
      'keep that',
      'remember that',
      'note what we just',
      'save what we just',
      'can you note that',
      'please note that',
      'bookmark that',
      'mark that down'
    ];

    const saveNextPhrases = [
      'note what i\'m about to',
      'save what i\'m going to',
      'make a note',
      'here\'s a note',
      'note this',
      'save this',
      'i want to note',
      'let me note'
    ];

    for (const phrase of savePreviousPhrases) {
      if (lower.includes(phrase)) {
        return { hasIntent: true, type: 'previous' };
      }
    }

    for (const phrase of saveNextPhrases) {
      if (lower.includes(phrase)) {
        return { hasIntent: true, type: 'next' };
      }
    }

    return { hasIntent: false, type: null };
  };

  // Enhanced transcript handler with note detection
  const handleTranscript = useCallback(async (text: string) => {
    console.log('🎤 VoiceWithNotes received transcript:', text);

    // Check if we're waiting for a note
    if (isWaitingForNoteRef.current) {
      console.log('📝 Saving note from next input:', text);
      isWaitingForNoteRef.current = false;

      // Save the note
      if (onNoteDetected) {
        await onNoteDetected(text, 'next');
      } else {
        await saveNoteToAPI(text, 'user');
      }

      // Show confirmation
      toast.success('✨ Note saved', {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      });

      // Pass a confirmation message instead of the original transcript
      onTranscript("I've saved that note for you. What would you like to explore next?");
      return;
    }

    // Check for note intent
    const intent = detectNoteIntent(text);

    if (intent.hasIntent) {
      console.log('📝 Note intent detected:', intent.type);

      if (intent.type === 'previous') {
        // Save the previous message
        const messageToSave = lastMaiaMessageRef.current || lastTranscriptRef.current;

        if (messageToSave) {
          if (onNoteDetected) {
            await onNoteDetected(messageToSave, 'previous');
          } else {
            await saveNoteToAPI(messageToSave, lastMaiaMessageRef.current ? 'maia' : 'user');
          }

          toast.success('✨ Previous message saved', {
            duration: 2000,
            position: 'bottom-center',
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            },
          });

          onTranscript("I've saved that to your notebook. What would you like to explore next?");
        } else {
          onTranscript("I don't have a previous message to save. Could you tell me what you'd like to note?");
        }
        return;
      } else if (intent.type === 'next') {
        // Check if the note content is in the same message
        const noteMatch = text.match(/(?:note this:|save this:|here's a note:)\s*(.+)/i);

        if (noteMatch && noteMatch[1]) {
          // Save the inline note
          const noteContent = noteMatch[1].trim();

          if (onNoteDetected) {
            await onNoteDetected(noteContent, 'next');
          } else {
            await saveNoteToAPI(noteContent, 'user');
          }

          toast.success('✨ Note saved', {
            duration: 2000,
            position: 'bottom-center',
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            },
          });

          onTranscript("I've saved your note. What would you like to explore next?");
        } else {
          // Wait for the next message
          isWaitingForNoteRef.current = true;
          onTranscript("I'm ready to save your note. Go ahead and tell me what you'd like to remember.");
        }
        return;
      }
    }

    // Store transcript for potential future noting
    lastTranscriptRef.current = text;

    // Pass through to original handler
    onTranscript(text);
  }, [onTranscript, onNoteDetected]);

  // Save note to API
  const saveNoteToAPI = async (text: string, speaker: 'user' | 'maia') => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source: 'voice',
          speaker,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // Method to update the last Maia message (called from parent)
  const updateLastMaiaMessage = useCallback((text: string) => {
    lastMaiaMessageRef.current = text;
  }, []);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    ...voiceRef.current!,
    saveLastMessage: async () => {
      const messageToSave = lastMaiaMessageRef.current || lastTranscriptRef.current;
      if (messageToSave) {
        await saveNoteToAPI(messageToSave, lastMaiaMessageRef.current ? 'maia' : 'user');
      }
    },
    updateLastMaiaMessage,
  }), [updateLastMaiaMessage]);

  return (
    <ContinuousConversation
      {...restProps}
      ref={voiceRef}
      onTranscript={handleTranscript}
    />
  );
});