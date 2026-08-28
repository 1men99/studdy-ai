import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionCard } from './QuestionCard'
import type { PracticeQuestion } from '@/types'

const multipleChoiceQuestion: PracticeQuestion = {
  id: 'q1',
  type: 'multiple_choice',
  question: 'What is the powerhouse of the cell?',
  options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Endoplasmic Reticulum'],
  answer: 'Mitochondria',
  explanation: 'Mitochondria generate most of the chemical energy needed to power the cell.',
}

const trueFalseQuestion: PracticeQuestion = {
  id: 'q2',
  type: 'true_false',
  question: 'Photosynthesis produces carbon dioxide as a byproduct.',
  options: [],
  answer: 'False',
  explanation: 'Photosynthesis releases oxygen as a byproduct.',
}

const fillBlankQuestion: PracticeQuestion = {
  id: 'q3',
  type: 'fill_blank',
  question: 'The chemical formula for water is ___.',
  options: [],
  answer: 'H2O',
  explanation: 'Water consists of two hydrogen atoms and one oxygen atom.',
}

const shortAnswerQuestion: PracticeQuestion = {
  id: 'q4',
  type: 'short_answer',
  question: 'Define velocity.',
  options: [],
  answer: 'Speed in a given direction',
  explanation: 'Velocity is a vector quantity combining speed and direction.',
}

describe('QuestionCard Component', () => {
  it('renders a multiple choice question with options and number badge', () => {
    render(<QuestionCard question={multipleChoiceQuestion} index={0} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText(/MULTIPLE CHOICE/i)).toBeInTheDocument()
    expect(screen.getByText('What is the powerhouse of the cell?')).toBeInTheDocument()
    expect(screen.getByText('Mitochondria')).toBeInTheDocument()
    expect(screen.getByText('Nucleus')).toBeInTheDocument()
  })

  it('evaluates correct multiple choice selection and shows explanation', () => {
    const handleAnswer = vi.fn()
    render(<QuestionCard question={multipleChoiceQuestion} index={0} onAnswer={handleAnswer} />)

    const correctOptionButton = screen.getByText('Mitochondria')
    fireEvent.click(correctOptionButton)

    expect(handleAnswer).toHaveBeenCalledWith('Mitochondria', true)
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument()
    expect(screen.getByText(multipleChoiceQuestion.explanation!)).toBeInTheDocument()
  })

  it('evaluates incorrect multiple choice selection and shows correct answer', () => {
    const handleAnswer = vi.fn()
    render(<QuestionCard question={multipleChoiceQuestion} index={0} onAnswer={handleAnswer} />)

    const wrongOptionButton = screen.getByText('Nucleus')
    fireEvent.click(wrongOptionButton)

    expect(handleAnswer).toHaveBeenCalledWith('Nucleus', false)
    expect(screen.getByText(/Correct Answer:/i)).toBeInTheDocument()
    expect(screen.getByText(multipleChoiceQuestion.explanation!)).toBeInTheDocument()
  })

  it('handles True/False selection correctly', () => {
    const handleAnswer = vi.fn()
    render(<QuestionCard question={trueFalseQuestion} index={1} onAnswer={handleAnswer} />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(/TRUE FALSE/i)).toBeInTheDocument()

    const falseButton = screen.getByText('False')
    fireEvent.click(falseButton)

    expect(handleAnswer).toHaveBeenCalledWith('False', true)
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument()
  })

  it('handles Fill-in-the-blank text submission', () => {
    const handleAnswer = vi.fn()
    render(<QuestionCard question={fillBlankQuestion} index={2} onAnswer={handleAnswer} />)

    const input = screen.getByPlaceholderText('___')
    fireEvent.change(input, { target: { value: 'H2O' } })

    const submitBtn = screen.getByRole('button', { name: /check answer/i })
    fireEvent.click(submitBtn)

    expect(handleAnswer).toHaveBeenCalledWith('H2O', true)
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument()
  })

  it('handles Short Answer text submission', () => {
    const handleAnswer = vi.fn()
    render(<QuestionCard question={shortAnswerQuestion} index={3} onAnswer={handleAnswer} />)

    const input = screen.getByPlaceholderText(/type your answer here/i)
    fireEvent.change(input, { target: { value: 'Speed in a given direction' } })

    const submitBtn = screen.getByRole('button', { name: /submit answer/i })
    fireEvent.click(submitBtn)

    expect(handleAnswer).toHaveBeenCalledWith('Speed in a given direction', true)
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument()
  })
})
