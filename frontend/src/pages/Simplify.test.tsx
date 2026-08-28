import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Simplify } from './Simplify'
import * as useSimplifyTextModule from '@/hooks/useSimplifyText'
import * as usePersistenceModule from '@/hooks/useSimplificationPersistence'

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: { fullName: 'Alex Student', primaryEmailAddress: { emailAddress: 'alex@example.com' } },
  }),
  UserButton: () => <button data-testid="user-button">Profile</button>,
}))

vi.mock('@/hooks/useSimplifyText')
vi.mock('@/hooks/useSimplificationPersistence')

const mockSimplificationResult = {
  plain_language: 'This is the simplified version of the contract. You must give 30 days notice to leave.',
  watch_out_for: [
    {
      category: 'Fees',
      title: 'Late Rent Penalty',
      description: '$50 fee after the 5th.',
      severity: 'alert',
    },
    {
      category: 'Deadlines',
      title: '30-Day Notice',
      description: 'Written notice required 30 days before moving out.',
      severity: 'warning',
    },
  ],
}

describe('Simplify Page Component', () => {
  it('renders initial empty state and text classification selector', () => {
    vi.mocked(useSimplifyTextModule.useSimplifyText).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: null,
      error: null,
      reset: vi.fn(),
    } as any)
    vi.mocked(usePersistenceModule.useSimplificationPersistence).mockReturnValue({
      persist: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <Simplify />
      </MemoryRouter>
    )

    expect(screen.getByText('Simplify Complex Text')).toBeInTheDocument()
    expect(screen.getByText('General Text')).toBeInTheDocument()
    expect(screen.getByText('Contract')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/paste your text here/i)).toBeInTheDocument()
  })

  it('enforces character minimum and triggers simplification mutation when valid', () => {
    const mockMutate = vi.fn()
    vi.mocked(useSimplifyTextModule.useSimplifyText).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      data: null,
      error: null,
      reset: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <Simplify />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText(/paste your text here/i)
    const simplifyBtn = screen.getByRole('button', { name: /simplify text/i })

    // When empty/short, button is disabled
    expect(simplifyBtn).toBeDisabled()

    // Type 60 characters
    const validText = 'The Tenant must pay rent on the first day of every month or face penalty.'
    fireEvent.change(textarea, { target: { value: validText } })
    expect(simplifyBtn).not.toBeDisabled()

    fireEvent.click(simplifyBtn)
    expect(mockMutate).toHaveBeenCalledWith(
      { text: validText, text_type: 'general' },
      expect.any(Object)
    )
  })

  it('renders side-by-side Original Text, Plain Language, and Watch Out cards when result is available', () => {
    vi.mocked(useSimplifyTextModule.useSimplifyText).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: mockSimplificationResult,
      error: null,
      reset: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <Simplify />
      </MemoryRouter>
    )

    // Check Original Text & Plain Language header panels
    expect(screen.getByText('Original Text')).toBeInTheDocument()
    expect(screen.getAllByText(/Plain Language/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/This is the simplified version of the contract/i)).toBeInTheDocument()

    // Check Watch Out items
    expect(screen.getByText('Late Rent Penalty')).toBeInTheDocument()
    expect(screen.getByText('$50 fee after the 5th.')).toBeInTheDocument()
    expect(screen.getByText('30-Day Notice')).toBeInTheDocument()
  })
})
