import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL

const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null
const queryClient = new QueryClient()

const clerkAppearance = {
  variables: {
    colorPrimary: 'hsl(243 75% 59%)',
    colorBackground: 'hsl(0 0% 100%)',
    colorText: 'hsl(0 0% 15%)',
    colorTextSecondary: 'hsl(240 4% 46%)',
    borderRadius: '1.15rem',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    card: 'shadow-xl rounded-2xl border border-border',
    formButtonPrimary:
      'bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition-all',
    footerActionLink: 'text-primary hover:underline',
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={clerkAppearance}
        afterSignOutUrl="/"
      >
        {convex ? (
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
          </ConvexProviderWithClerk>
        ) : <QueryClientProvider client={queryClient}><App /></QueryClientProvider>}
      </ClerkProvider>
    ) : (
      <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
    )}
  </StrictMode>,
)
