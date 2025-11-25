'use client';

import { useState, useCallback } from 'react';

export interface ToastOptions {
  duration?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const { duration = 3000, type = 'info' } = options;
    const id = Math.random().toString(36).substr(2, 9);

    const toast: Toast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast
  };
}