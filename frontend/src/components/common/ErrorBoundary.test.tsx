import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Explosion in component!')
  }
  return <div>Component loaded safely</div>
}

describe('ErrorBoundary Component', () => {
  it('renders children when there are no errors', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Component loaded safely')).toBeInTheDocument()
  })

  it('renders fallback error UI when a child component throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/Study encountered an unexpected error/i)).toBeInTheDocument()
    expect(screen.getByText('Explosion in component!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()

    spy.mockRestore()
  })

  it('supports custom fallback node', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div>Custom Error Page</div>}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom Error Page')).toBeInTheDocument()
    spy.mockRestore()
  })
})
