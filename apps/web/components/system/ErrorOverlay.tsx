'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

export function ErrorOverlay() {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  // Listen for errors from window events
  useEffect(() => {
    const handleError = (event: CustomEvent) => {
      const newError: ErrorMessage = {
        id: Math.random().toString(36).substr(2, 9),
        message: event.detail.message,
        type: event.detail.type || 'error',
        timestamp: Date.now()
      };
      setErrors(prev => [...prev, newError]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setErrors(prev => prev.filter(e => e.id !== newError.id));
      }, 5000);
    };

    window.addEventListener('app-error', handleError as any);
    return () => window.removeEventListener('app-error', handleError as any);
  }, []);

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`
            px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm
            animate-in slide-in-from-right duration-300
            flex items-start gap-3 pointer-events-auto
            ${error.type === 'error' ? 'bg-red-500/90 text-white border border-red-600' : ''}
            ${error.type === 'warning' ? 'bg-yellow-500/90 text-black border border-yellow-600' : ''}
            ${error.type === 'info' ? 'bg-blue-500/90 text-white border border-blue-600' : ''}
          `}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(error.type)}
          </div>
          <div className="flex-1 text-sm font-medium">
            {error.message}
          </div>
          <button
            onClick={() => removeError(error.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Helper function to show errors from anywhere in the app
export function showError(message: string, type: 'error' | 'warning' | 'info' = 'error') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-error', { 
      detail: { message, type } 
    }));
  }
}