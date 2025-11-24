"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "./button"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: (id: string) => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = 'default', duration = 5000, onClose }, ref) => {
    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          onClose?.(id)
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [duration, id, onClose])

    const variants = {
      default: {
        bg: "bg-background/95 backdrop-blur-xl border-amber-500/20",
        icon: Info,
        iconColor: "text-amber-400"
      },
      success: {
        bg: "bg-green-500/10 backdrop-blur-xl border-green-500/20",
        icon: CheckCircle,
        iconColor: "text-green-400"
      },
      error: {
        bg: "bg-red-500/10 backdrop-blur-xl border-red-500/20", 
        icon: AlertCircle,
        iconColor: "text-red-400"
      },
      warning: {
        bg: "bg-orange-500/10 backdrop-blur-xl border-orange-500/20",
        icon: AlertTriangle,
        iconColor: "text-orange-400"
      },
      info: {
        bg: "bg-blue-500/10 backdrop-blur-xl border-blue-500/20",
        icon: Info,
        iconColor: "text-blue-400"
      }
    }

    const { bg, icon: Icon, iconColor } = variants[variant]

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-lg border p-4 pr-6 shadow-lg transition-all hover:scale-105 ${bg}`}
      >
        <div className="flex items-center space-x-3">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <div className="grid gap-1">
            {title && (
              <div className="text-sm font-semibold text-white">{title}</div>
            )}
            {description && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 rounded-full p-0 text-muted-foreground hover:text-white"
          onClick={() => onClose?.(id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </motion.div>
    )
  }
)
Toast.displayName = "Toast"

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export { Toast }