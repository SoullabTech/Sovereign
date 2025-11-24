"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function JournalModal({ isOpen, onClose, onSuccess }: JournalModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/journal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || 'Untitled Reflection',
          content: content.trim(),
          element: 'aether', // Default element
          metadata: {
            source: 'sacred-mirror',
            timestamp: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create journal entry');
      }

      toast({
        title: "Journal entry created",
        description: "Your reflection has been saved to the memory garden.",
      });

      // Reset form
      setTitle("");
      setContent("");
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Journal creation error:', error);
      toast({
        title: "Failed to save",
        description: "There was an error saving your journal entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sacred-cosmic/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-sacred-navy/95 border border-gold-divine/20 rounded-sacred shadow-deep p-6">
        <h2 className="text-2xl font-sacred text-gold-divine mb-4">New Journal Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-4 py-2 bg-sacred-blue/30 border border-gold-divine/20 rounded-sacred text-neutral-pure placeholder-neutral-mystic focus:border-gold-divine focus:outline-none"
            />
          </div>
          
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your reflection..."
              className="w-full h-64 px-4 py-3 bg-sacred-blue/30 border border-gold-divine/20 rounded-sacred text-neutral-pure placeholder-neutral-mystic focus:border-gold-divine focus:outline-none resize-none"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-neutral-mystic hover:text-neutral-silver transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gold-divine text-sacred-cosmic rounded-sacred hover:bg-gold-amber transition-colors shadow-sacred disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}