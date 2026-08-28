import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser, UserButton } from '@clerk/clerk-react'
import {
  Menu,
  X,
  Sparkles,
  Home,
  HelpCircle,
  BookOpen,
  User,
  FileText,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Loader2,
  ChevronDown,
  Upload,
} from 'lucide-react'
import { useGenerateQuestions } from '@/hooks/useGenerateQuestions'
import { usePracticePersistence } from '@/hooks/usePracticePersistence'
import { QuestionCard } from '@/components/practice/QuestionCard'

type Difficulty = 'easy' | 'medium' | 'hard'

export function Practice() {
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [questionIds, setQuestionIds] = useState<Map<string, string>>(new Map())
  const [sessionId, setSessionId] = useState('')
  const [score, setScore] = useState<number>(0)
  const [answeredCount, setAnsweredCount] = useState<number>(0)
  const [visibleCount, setVisibleCount] = useState<number>(4)

  const generation = useGenerateQuestions()
  const persistence = usePracticePersistence()
  const result = generation.data

  const charCount = notes.length
  const isValidLength = notes.trim().length >= 50 && charCount <= 20000
  const isTooShort = notes.length > 0 && notes.trim().length < 50
  const isTooLong = charCount > 20000

  // Infer subject title from the first line of notes if available
  const inferSubjectTitle = () => {
    if (!notes.trim()) return 'Practice Set'
    const firstLine = notes.trim().split('\n')[0].trim().replace(/^#+\s*/, '')
    if (firstLine.length > 3 && firstLine.length < 40) {
      return `${firstLine} Practice`
    }
    return 'Biology 101 Practice'
  }

  const handleGenerate = () => {
    if (!isValidLength || generation.isPending) return
    setScore(0)
    setAnsweredCount(0)
    setVisibleCount(4)
    generation.mutate(
      { notes, difficulty },
      {
        onSuccess: async (data) => {
          const persisted = await persistence.persistQuestions(notes, data.questions)
          setSessionId(persisted.sessionId)
          setQuestionIds(persisted.questionIds)
        },
      }
    )
  }

  const handleAnswerRecorded = (questionClientKey: string, answer: string, isCorrect: boolean) => {
    setAnsweredCount((prev) => prev + 1)
    if (isCorrect) {
      setScore((prev) => prev + 1)
    }
    const questionId = questionIds.get(questionClientKey)
    if (sessionId && questionId) {
      void persistence.saveAnswer(sessionId, questionId, answer, isCorrect)
    }
  }

  const handleReset = () => {
    generation.reset()
    setNotes('')
    setSessionId('')
    setQuestionIds(new Map())
    setScore(0)
    setAnsweredCount(0)
    setVisibleCount(4)
  }

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen pb-24 md:pb-12 flex flex-col font-sans selection:bg-primary-container selection:text-white">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-surface/95 backdrop-blur-md flex items-center justify-between px-margin-mobile py-3.5 md:px-margin-desktop md:py-4 z-40 border-b border-surface-container-low/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-stitch-primary hover:bg-surface-container-low transition-colors active:opacity-80 p-2 -ml-2 rounded-full flex items-center justify-center"
            aria-label="Toggle navigation menu"
            type="button"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 text-stitch-primary font-bold text-2xl tracking-tight">
            <Sparkles className="w-6 h-6 text-stitch-primary" />
            <span>Studdy AI</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
          <Link to="/dashboard" className="hover:text-stitch-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/practice" className="text-stitch-primary font-semibold transition-colors">
            Practice
          </Link>
          <Link to="/simplify" className="hover:text-stitch-primary transition-colors">
            Simplify
          </Link>
          <Link to="/history" className="hover:text-stitch-primary transition-colors">
            Study History
          </Link>
        </nav>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-on-surface leading-tight">
              {user?.fullName || user?.firstName || 'Student'}
            </span>
            <span className="text-xs text-on-surface-variant">
              {user?.primaryEmailAddress?.emailAddress || 'Pro Learner'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center cursor-pointer shadow-sm ring-2 ring-surface-container-high transition-transform hover:scale-105">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10' } }} />
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-on-surface/20 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-4/5 max-w-xs h-full bg-surface-container-lowest p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
                <div className="flex items-center gap-2 text-stitch-primary font-bold text-xl">
                  <Sparkles className="w-5 h-5" />
                  <span>Studdy AI</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low font-medium text-sm transition-colors"
                >
                  <Home className="w-5 h-5 text-stitch-primary" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/practice"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-semibold text-sm transition-colors"
                >
                  <HelpCircle className="w-5 h-5 text-stitch-primary" />
                  <span>Practice Questions</span>
                </Link>
                <Link
                  to="/simplify"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low font-medium text-sm transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-stitch-primary" />
                  <span>Plain Language</span>
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low font-medium text-sm transition-colors"
                >
                  <FileText className="w-5 h-5 text-stitch-primary" />
                  <span>Study History</span>
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-container-high flex items-center justify-between text-xs text-on-surface-variant">
              <span>Study AI Academic Platform</span>
              <span className="font-mono">v1.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-6 md:py-10 max-w-5xl mx-auto w-full space-y-6 md:space-y-8">
        {!result ? (
          <>
            {/* Header Section */}
            <section className="space-y-1.5">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
                Practice Generator
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant">
                Paste your class notes below to generate targeted practice questions.
              </p>
            </section>

            {/* Input Area (Bento Card Style) */}
            <section className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-6 border border-surface-container-high flex flex-col gap-4 relative overflow-hidden group hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300">
              {/* Subtle ambient gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-fixed to-transparent opacity-30 rounded-full blur-3xl -z-10 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none" />

              <div className="flex justify-between items-center w-full">
                <label
                  htmlFor="notes-input"
                  className="text-sm md:text-base font-semibold text-on-surface flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-stitch-primary" />
                  <span>Source Material</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotes(
                        'Photosynthesis is the process by which green plants and certain other organisms transform light energy into chemical energy. During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds like glucose. Cellular respiration mainly occurs in the mitochondria, often described as the powerhouse of the cell. DNA contains the genetic instructions used in the development and functioning of all living organisms.'
                      )
                    }}
                    className="bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant p-2 rounded-full transition-colors"
                    title="Insert Sample Biology Notes"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Textarea Input */}
              <div className="relative w-full">
                <textarea
                  id="notes-input"
                  rows={8}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Paste your history lecture on the French Revolution, or your biology notes on mitosis..."
                  className={`w-full bg-surface-container-low border-2 border-transparent focus:border-primary-container focus:bg-white rounded-xl p-4 text-sm md:text-base text-on-surface resize-none transition-all placeholder:text-outline-variant ${
                    isTooShort || isTooLong ? 'border-error focus:border-error' : ''
                  }`}
                />

                {/* Character Count */}
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-xs border border-surface-container-high flex items-center gap-1 text-xs font-mono text-on-surface-variant">
                  <span className={isTooLong ? 'text-error font-bold' : ''}>
                    {charCount.toLocaleString()}
                  </span>{' '}
                  / 20,000
                </div>
              </div>

              {/* Validation Warning */}
              {isTooShort && (
                <div className="bg-error-container/60 text-on-error-container p-3 rounded-lg flex items-start gap-3 border border-[#f5b8b8]">
                  <div className="text-xs">
                    <span className="font-semibold text-error block">Input Required</span>
                    <span>Please paste at least 50 characters of notes ({50 - notes.trim().length} more needed).</span>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-on-surface-variant mr-1 flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Difficulty:
                  </span>
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                        difficulty === diff
                          ? 'bg-secondary-container text-stitch-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                <button
                  id="generate-btn"
                  type="button"
                  onClick={handleGenerate}
                  disabled={!isValidLength || generation.isPending}
                  className="w-full sm:w-auto bg-primary-container text-white hover:bg-primary-stitch active:scale-95 transition-all px-8 py-3 rounded-full font-medium text-sm md:text-base flex items-center justify-center gap-2 min-h-[48px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{generation.isPending ? 'Generating...' : 'Generate 10 Questions'}</span>
                </button>
              </div>
            </section>

            {/* Loading State Overlay (Matching practice results code.html) */}
            {generation.isPending && (
              <section className="flex flex-col items-center justify-center p-8 md:p-12 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-primary-container/40 animate-pulse space-y-4">
                <Loader2 className="w-10 h-10 text-stitch-primary animate-spin mb-2" />
                <h2 className="text-xl md:text-2xl font-semibold text-on-surface text-center">
                  Reading your notes and creating practice questions…
                </h2>
                <p className="text-xs md:text-sm text-on-surface-variant text-center max-w-md">
                  This usually takes a few seconds. We're analyzing your notes and formatting targeted practice questions.
                </p>
                <div className="w-full max-w-md space-y-3 pt-4">
                  <div className="h-16 w-full rounded-lg bg-surface-container-low animate-pulse" />
                  <div className="h-16 w-full rounded-lg bg-surface-container-low animate-pulse" />
                  <div className="h-16 w-full rounded-lg bg-surface-container-low animate-pulse" />
                </div>
              </section>
            )}

            {/* Results Section (Empty State Initially matching practice question screen.png) */}
            {!generation.isPending && (
              <section className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold text-on-surface">Generated Practice</h3>
                <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[260px]">
                  <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant opacity-60 mb-1">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold text-on-surface">
                    Ready to test your knowledge?
                  </h4>
                  <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
                    Paste your notes above and hit generate to create a custom quiz based on your material.
                  </p>
                </div>
              </section>
            )}
          </>
        ) : (
          /* Practice Results State (Matching practice results page code.html & screen.png) */
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header with Title and Ready Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-on-surface">
                  {inferSubjectTitle()}
                </h2>
                <p className="text-sm md:text-base text-on-surface-variant mt-1">
                  10 questions based on your latest notes
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1 rounded-full bg-surface-container-high font-semibold text-xs text-on-surface flex items-center gap-1.5">
                  <span>Score:</span>
                  <span className="text-stitch-primary font-bold">{score}</span>
                  <span className="text-on-surface-variant font-normal">/ {answeredCount} answered</span>
                </div>

                <div className="bg-primary-container text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready</span>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Notes</span>
                </button>
              </div>
            </div>

            {/* Bento Grid of Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.questions.slice(0, visibleCount).map((question, index) => (
                <QuestionCard
                  key={question.id || index}
                  question={question}
                  index={index}
                  onAnswer={(answer, isCorrect) => handleAnswerRecorded(question.id, answer, isCorrect)}
                />
              ))}
            </div>

            {/* Show Remaining Questions / Expansion Toggle */}
            {visibleCount < result.questions.length && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount(result.questions.length)}
                  className="bg-surface-container text-stitch-primary font-semibold text-sm px-6 py-3 rounded-full hover:bg-surface-dim transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Show Remaining {result.questions.length - visibleCount} Questions</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Complete & Create Another Quiz CTA */}
            {visibleCount >= result.questions.length && (
              <div className="flex justify-center pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-stitch-primary text-white font-medium text-sm md:text-base px-8 py-3 rounded-full hover:bg-on-primary-fixed-variant transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Another Practice Set</span>
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* BottomNavBar (Mobile Only matching practice results screen.png) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-surface/95 backdrop-blur-md shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] border-t border-surface-container-low/80 z-50 md:hidden">
        {/* Home */}
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Home</span>
        </Link>
        {/* Practice (Active) */}
        <Link
          to="/practice"
          className="flex flex-col items-center justify-center bg-secondary-container text-stitch-primary rounded-xl px-4 py-2 active:scale-95 transition-transform duration-150 w-16"
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-semibold leading-none">Practice</span>
        </Link>
        {/* Simplify */}
        <Link
          to="/simplify"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Simplify</span>
        </Link>
        {/* Profile */}
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Profile</span>
        </Link>
      </nav>
    </div>
  )
}