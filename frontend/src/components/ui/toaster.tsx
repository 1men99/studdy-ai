import type { ReactNode } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast, dismissToast, type ToastVariant } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const variantStyles: Record<ToastVariant, { container: string; icon: ReactNode }> = {
  default: {
    container: 'bg-card border-border text-foreground shadow-lg',
    icon: <Info className="w-5 h-5 text-primary flex-shrink-0" />,
  },
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/30 text-foreground dark:text-emerald-100 shadow-emerald-500/10 shadow-lg',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  },
  error: {
    container: 'bg-rose-500/10 border-rose-500/30 text-foreground dark:text-rose-100 shadow-rose-500/10 shadow-lg',
    icon: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/30 text-foreground dark:text-amber-100 shadow-amber-500/10 shadow-lg',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  },
  info: {
    container: 'bg-sky-500/10 border-sky-500/30 text-foreground dark:text-sky-100 shadow-sky-500/10 shadow-lg',
    icon: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />,
  },
}

export function Toaster() {
  const { toasts } = useToast()

  if (!toasts.length) return null

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex max-h-screen w-full max-w-sm flex-col gap-2 pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((item) => {
        const variant = item.variant || 'default'
        const { container, icon } = variantStyles[variant]

        return (
          <div
            key={item.id}
            role="status"
            aria-live="polite"
            className={cn(
              'pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in',
              container
            )}
          >
            {icon}
            <div className="flex-1 space-y-1 text-left">
              {item.title && (
                <div className="text-sm font-semibold leading-none tracking-tight">
                  {item.title}
                </div>
              )}
              {item.description && (
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismissToast(item.id)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </aside>
  )
}
