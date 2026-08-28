import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotesInput } from './NotesInput'

describe('NotesInput Component', () => {
  it('renders label, placeholder, and character count correctly', () => {
    const handleChange = vi.fn()
    render(<NotesInput value="" onChange={handleChange} maxLength={20000} />)

    expect(screen.getByLabelText(/class notes/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/paste your class notes here/i)).toBeInTheDocument()
    expect(screen.getByText('0 / 20,000')).toBeInTheDocument()
  })

  it('displays error warning when text is too short (< 50 chars)', () => {
    const handleChange = vi.fn()
    render(<NotesInput value="Short text" onChange={handleChange} maxLength={20000} />)

    expect(screen.getByText(/add at least 50 characters/i)).toBeInTheDocument()
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
  })

  it('displays default guidance when text length is empty or valid', () => {
    const handleChange = vi.fn()
    const validNotes = 'A'.repeat(60)
    render(<NotesInput value={validNotes} onChange={handleChange} maxLength={20000} />)

    expect(screen.getByText(/use your own notes for the most useful questions/i)).toBeInTheDocument()
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByText('60 / 20,000')).toBeInTheDocument()
  })

  it('calls onChange handler when typing in textarea', () => {
    const handleChange = vi.fn()
    render(<NotesInput value="" onChange={handleChange} maxLength={20000} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'New class notes entered' } })

    expect(handleChange).toHaveBeenCalledWith('New class notes entered')
  })
})
