import { useState, useEffect, useCallback } from 'react'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastListener = (toasts: ToastItem[]) => void

let toastsMemory: ToastItem[] = []
const listeners = new Set<ToastListener>()

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastsMemory]))
}

export function dismissToast(id: string) {
  toastsMemory = toastsMemory.filter((t) => t.id !== id)
  notifyListeners()
}

export function toast(options: Omit<ToastItem, 'id'>) {
  const id = Math.random().toString(36).slice(2, 9)
  const duration = options.duration ?? (options.variant === 'error' ? 6000 : 4000)
  const newToast: ToastItem = { ...options, id, duration }

  toastsMemory = [newToast, ...toastsMemory.slice(0, 4)] // Keep up to 5 toasts
  notifyListeners()

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id)
    }, duration)
  }

  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(toastsMemory)

  useEffect(() => {
    listeners.add(setToasts)
    return () => {
      listeners.delete(setToasts)
    }
  }, [])

  const addToast = useCallback((options: Omit<ToastItem, 'id'>) => toast(options), [])
  const removeToast = useCallback((id: string) => dismissToast(id), [])

  return {
    toasts,
    toast: addToast,
    dismiss: removeToast,
  }
}
