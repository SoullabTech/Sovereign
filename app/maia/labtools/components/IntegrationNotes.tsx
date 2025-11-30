'use client';

import { useState, useEffect } from 'react';
import { LabToolsService } from '../lib/LabToolsService';

interface IntegrationNotesProps {
  service: LabToolsService;
}

export function IntegrationNotes({ service }: IntegrationNotesProps) {
  const [notes, setNotes] = useState<IntegrationNote[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem('maia-integration-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotes = (updatedNotes: IntegrationNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('maia-integration-notes', JSON.stringify(updatedNotes));
  };

  const addNote = () => {
    if (newNote.trim()) {
      const note: IntegrationNote = {
        id: Date.now().toString(),
        content: newNote.trim(),
        timestamp: Date.now(),
        type: 'integration'
      };
      saveNotes([note, ...notes]);
      setNewNote('');
    }
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">📝 Integration Notes</h2>

      {/* Add New Note */}
      <div className="mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Record insights, experiences, or integration notes..."
          className="w-full p-3 bg-black/30 border border-gray-600 rounded-lg text-white text-sm resize-none focus:border-purple-500 focus:outline-none"
          rows={3}
        />
        <button
          onClick={addNote}
          disabled={!newNote.trim()}
          className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all"
        >
          Add Note
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No integration notes yet
          </div>
        ) : (
          notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={() => deleteNote(note.id)}
            />
          ))
        )}
      </div>

      {/* Integration Prompts */}
      <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded">
        <div className="text-sm font-semibold text-purple-300 mb-2">
          💫 Integration Prompts
        </div>
        <div className="text-xs text-purple-200 space-y-1">
          <div>• What did I notice in my body?</div>
          <div>• What patterns or insights emerged?</div>
          <div>• How can I integrate this into daily life?</div>
          <div>• What feels different or new?</div>
        </div>
      </div>
    </div>
  );
}

interface IntegrationNote {
  id: string;
  content: string;
  timestamp: number;
  type: 'integration' | 'insight' | 'experience';
}

interface NoteCardProps {
  note: IntegrationNote;
  onDelete: () => void;
}

function NoteCard({ note, onDelete }: NoteCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-black/30 border border-gray-600 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-gray-400">
          {formatDate(note.timestamp)}
        </div>
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-400 text-xs"
        >
          ✕
        </button>
      </div>

      <div className="text-sm text-white whitespace-pre-wrap">
        {note.content}
      </div>
    </div>
  );
}