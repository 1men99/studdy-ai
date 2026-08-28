import { useState } from 'react'
import { CheckCircle2, X, Circle, Check, Sparkles } from 'lucide-react'
import type { PracticeQuestion } from '@/types'

interface QuestionCardProps {
  question: PracticeQuestion
  index: number
  onAnswer?: (answer: string, isCorrect: boolean) => void
}

export function QuestionCard({ question, index, onAnswer }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [textAnswer, setTextAnswer] = useState<string>('')
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)

  const formattedType = question.type.replace('_', ' ').toUpperCase()

  const handleMultipleChoiceSelect = (option: string) => {
    if (isSubmitted) return
    setSelectedOption(option)
    const correct = option.trim().toLowerCase() === question.answer.trim().toLowerCase()
    setIsCorrect(correct)
    setIsSubmitted(true)
    onAnswer?.(option, correct)
  }

  const handleTrueFalseSelect = (value: 'True' | 'False') => {
    if (isSubmitted) return
    setSelectedOption(value)
    const correct = value.toLowerCase() === question.answer.trim().toLowerCase()
    setIsCorrect(correct)
    setIsSubmitted(true)
    onAnswer?.(value, correct)
  }

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!textAnswer.trim() || isSubmitted) return
    const correct = textAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
    setIsCorrect(correct)
    setIsSubmitted(true)
    onAnswer?.(textAnswer, correct)
  }

  // Parse fill-in-the-blank text if it contains blanks like [___] or ___
  const renderFillInBlankQuestion = () => {
    const parts = question.question.split(/_{2,}|\[_+\]|\.{3,}/)
    if (parts.length > 1) {
      return (
        <span className="leading-relaxed">
          {parts[0]}
          <input
            type="text"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={isSubmitted}
            placeholder="___"
            className="border-b-2 border-primary-container bg-surface-container-low mx-2 w-32 px-2 py-1 focus:outline-none focus:ring-0 text-center rounded-t-md text-on-surface font-semibold disabled:opacity-80"
          />
          {parts.slice(1).join('')}
        </span>
      )
    }
    return (
      <div className="space-y-3">
        <span>{question.question}</span>
        <div>
          <input
            type="text"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={isSubmitted}
            placeholder="Type your answer here..."
            className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary-container rounded-lg p-3 text-on-surface resize-none"
          />
        </div>
      </div>
    )
  }

  const isWide = question.type === 'fill_blank' || question.type === 'short_answer'

  return (
    <div
      className={`bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-container-high/60 flex flex-col justify-between transition-all hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] ${
        isWide ? 'md:col-span-2' : ''
      }`}
    >
      <div>
        {/* Number badge and type pill */}
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-surface-container text-stitch-primary font-semibold text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-on-surface-variant font-semibold text-xs uppercase tracking-wide">
            {formattedType}
          </span>
        </div>

        {/* Question Text */}
        <h3 className="text-base md:text-lg font-medium text-on-surface mb-4 leading-relaxed">
          {question.type === 'fill_blank' ? renderFillInBlankQuestion() : question.question}
        </h3>
      </div>

      {/* Answer Controls */}
      <div className="mt-auto space-y-3 pt-2">
        {/* Multiple Choice Options */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-2">
            {(question.options || []).map((option) => {
              const isSelected = selectedOption === option
              const isActualCorrect = option.trim().toLowerCase() === question.answer.trim().toLowerCase()

              let optionClass =
                'border-outline-variant hover:border-primary-container hover:bg-surface-container-low text-on-surface'
              let iconElement = (
                <Circle className="w-5 h-5 text-outline-variant group-hover:text-primary-container shrink-0" />
              )

              if (isSubmitted) {
                if (isActualCorrect) {
                  optionClass = 'border-primary-container bg-primary-container text-white font-medium shadow-xs'
                  iconElement = <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                } else if (isSelected && !isActualCorrect) {
                  optionClass = 'border-error bg-error-container text-on-error-container font-medium'
                  iconElement = <X className="w-5 h-5 text-error shrink-0" />
                } else {
                  optionClass = 'border-outline-variant/40 opacity-50 text-on-surface-variant'
                  iconElement = <Circle className="w-5 h-5 text-outline-variant/40 shrink-0" />
                }
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleMultipleChoiceSelect(option)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-sm md:text-base flex items-center justify-between group cursor-pointer disabled:cursor-default ${optionClass}`}
                >
                  <span className="mr-3">{option}</span>
                  {iconElement}
                </button>
              )
            })}
          </div>
        )}

        {/* True / False Options */}
        {question.type === 'true_false' && (
          <div className="flex gap-4">
            {(['True', 'False'] as const).map((val) => {
              const isSelected = selectedOption === val
              const isActualCorrect = val.toLowerCase() === question.answer.trim().toLowerCase()

              let btnClass =
                'border-outline-variant hover:border-primary-container hover:bg-surface-container-low text-on-surface'

              if (isSubmitted) {
                if (isActualCorrect) {
                  btnClass = 'border-primary-container bg-primary-container text-white font-bold'
                } else if (isSelected && !isActualCorrect) {
                  btnClass = 'border-error bg-error-container text-on-error-container font-bold'
                } else {
                  btnClass = 'border-outline-variant/40 opacity-50 text-on-surface-variant'
                }
              }

              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleTrueFalseSelect(val)}
                  disabled={isSubmitted}
                  className={`flex-1 p-3 rounded-lg border font-medium text-sm md:text-base text-center transition-all cursor-pointer disabled:cursor-default ${btnClass}`}
                >
                  {val}
                </button>
              )
            })}
          </div>
        )}

        {/* Fill in the Blank Check Action */}
        {question.type === 'fill_blank' && !isSubmitted && (
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => handleTextSubmit()}
              disabled={!textAnswer.trim()}
              className="bg-surface-container-highest text-stitch-primary font-semibold text-sm px-5 py-2 rounded-lg hover:bg-surface-dim transition-colors disabled:opacity-50 cursor-pointer"
            >
              Check Answer
            </button>
          </div>
        )}

        {/* Short Answer */}
        {question.type === 'short_answer' && (
          <div className="space-y-3">
            <textarea
              rows={3}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={isSubmitted}
              placeholder="Type your answer here..."
              className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary-container rounded-lg p-3 text-sm md:text-base text-on-surface resize-none h-24 focus:outline-none disabled:opacity-80"
            />
            {!isSubmitted && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-on-surface-variant text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-stitch-primary" /> AI will review your answer
                </span>
                <button
                  type="button"
                  onClick={() => handleTextSubmit()}
                  disabled={!textAnswer.trim()}
                  className="bg-stitch-primary text-white font-medium text-sm px-6 py-2 rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submitted Feedback Box */}
        {isSubmitted && (
          <div
            className={`p-3.5 rounded-lg border mt-3 text-xs md:text-sm space-y-1 animate-in fade-in duration-200 ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                : 'bg-surface-container-low border-surface-container-high text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {isCorrect ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <span className="text-stitch-primary font-bold">Correct Answer:</span>
                  <span className="font-semibold text-on-surface">{question.answer}</span>
                </>
              )}
            </div>
            {question.explanation && (
              <p className="text-on-surface-variant text-xs leading-relaxed pt-1">
                {question.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}