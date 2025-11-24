'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Toast as ToastType } from '@/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const toastStyles = {
  info: 'bg-blue-600 border-blue-500',
  success: 'bg-emerald-600 border-emerald-500',
  warning: 'bg-amber-600 border-amber-500',
  error: 'bg-red-600 border-red-500'
};

const toastIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle
};

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    // Animate in
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 150);
  };

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2 z-[9000]
        ${toastStyles[toast.type]}
        text-white px-4 py-3 rounded-lg shadow-lg border
        flex items-center gap-3 min-w-[300px] max-w-[500px]
        transition-all duration-300
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-2'
        }
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      
      <div className="flex-1 text-sm">
        {toast.message}
      </div>

      <button
        onClick={handleRemove}
        className="text-white/80 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div 
          key={toast.id}
          style={{ 
            transform: `translateY(${-index * 70}px)` 
          }}
        >
          <Toast toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </>
  );
}