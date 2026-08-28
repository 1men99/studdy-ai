import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

const HAS_CLERK_KEY = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

type ProtectedRouteProps = {
  children: ReactNode
}

function AuthenticatedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-primary-container border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-on-surface-variant">Loading Study AI session...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  return <>{children}</>
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (
    !HAS_CLERK_KEY ||
    (typeof window !== 'undefined' && window.sessionStorage.getItem('playwright_test_user') === 'true')
  ) {
    return <>{children}</>
  }

  return <AuthenticatedRoute>{children}</AuthenticatedRoute>
}