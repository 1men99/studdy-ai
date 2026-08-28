import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import * as clerk from '@clerk/clerk-react'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
}))

describe('ProtectedRoute Component', () => {
  it('renders loading spinner when auth is not loaded', () => {
    vi.mocked(clerk.useAuth).mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText(/loading study ai session/i)).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to /sign-in when user is not signed in', () => {
    vi.mocked(clerk.useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/sign-in" element={<div>Sign In Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Sign In Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user is signed in', () => {
    vi.mocked(clerk.useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'user_123',
      sessionId: 'sess_123',
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
