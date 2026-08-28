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
  Lightbulb,
  AlertTriangle,
  CreditCard,
  Calendar,
  Gavel,
  Copy,
  Check,
  RotateCcw,
  FileText,
  ShieldAlert,
  Coins,
} from 'lucide-react'
import { useSimplifyText } from '@/hooks/useSimplifyText'
import { useSimplificationPersistence } from '@/hooks/useSimplificationPersistence'
import type { TextClassification } from '@/types'

const textTypes: { value: TextClassification; label: string }[] = [
  { value: 'general', label: 'General Text' },
  { value: 'textbook', label: 'Textbook' },
  { value: 'bill', label: 'Bill' },
  { value: 'contract', label: 'Contract' },
]

export function Simplify() {
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [text, setText] = useState('')
  const [textType, setTextType] = useState<TextClassification>('general')
  const [copied, setCopied] = useState(false)

  const simplification = useSimplifyText()
  const persistence = useSimplificationPersistence()
  const result = simplification.data

  const charCount = text.length
  const isValidLength = text.trim().length >= 50 && charCount <= 20000
  const isTooShort = text.length > 0 && text.trim().length < 50
  const isTooLong = charCount > 20000

  const handleSimplify = () => {
    if (!isValidLength || simplification.isPending) return
    simplification.mutate(
      { text, text_type: textType },
      {
        onSuccess: (data) => {
          void persistence.persist(text, textType, data)
        },
      }
    )
  }

  const handleCopy = async () => {
    if (!result?.plain_language) return
    await navigator.clipboard.writeText(result.plain_language)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    simplification.reset()
    setText('')
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
          <Link to="/practice" className="hover:text-stitch-primary transition-colors">
            Practice Questions
          </Link>
          <Link to="/simplify" className="text-stitch-primary font-semibold transition-colors">
            Plain Language
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
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low font-medium text-sm transition-colors"
                >
                  <HelpCircle className="w-5 h-5 text-stitch-primary" />
                  <span>Practice Questions</span>
                </Link>
                <Link
                  to="/simplify"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-semibold text-sm transition-colors"
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

      {/* Main Content Canvas */}
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-6 md:py-10 max-w-5xl mx-auto w-full space-y-6 md:space-y-8">
        {/* Page Title & Intro */}
        <section className="space-y-1.5">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
            Simplify Complex Text
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant">
            Paste jargon, contracts, or textbook excerpts to get a plain language explanation.
          </p>
        </section>

        {/* Input Card */}
        <section className="bg-surface-container-lowest rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-5 md:p-6 border border-surface-container-low space-y-5">
          {/* Text Classification Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-on-surface-variant mr-1">
              Text Type:
            </span>
            {textTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTextType(t.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  textType === t.value
                    ? 'bg-primary-container text-white shadow-sm font-semibold'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="space-y-2">
            <label htmlFor="text-input" className="sr-only">
              Enter text to simplify
            </label>
            <textarea
              id="text-input"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here... (e.g., 'The party of the first part hereby covenants and agrees...')"
              className={`w-full p-4 rounded-xl bg-surface border text-sm md:text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container transition-all resize-y min-h-[140px] ${
                isTooShort || isTooLong
                  ? 'border-error/50 focus:border-error'
                  : 'border-outline-variant/60 focus:border-primary-container'
              }`}
            />

            {/* Validation and Character Counter */}
            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 px-1">
              <span>
                {isTooShort ? (
                  <span className="text-error font-medium">
                    Please provide at least 50 characters ({50 - text.trim().length} more needed).
                  </span>
                ) : isTooLong ? (
                  <span className="text-error font-medium">
                    Text exceeds maximum limit of 20,000 characters.
                  </span>
                ) : (
                  null
                )}
              </span>
              <span className={`font-mono ${isTooLong ? 'text-error font-bold' : ''}`}>
                {charCount.toLocaleString()} / 20,000
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-1">
            {result ? (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-on-surface-variant hover:text-stitch-primary flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Text</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleSimplify}
              disabled={!isValidLength || simplification.isPending}
              className="bg-stitch-primary text-white font-medium text-sm md:text-base px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-on-primary-fixed-variant active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{simplification.isPending ? 'Simplifying Text...' : 'Simplify Text'}</span>
            </button>
          </div>
        </section>

        {/* Results Area */}
        {!result && !simplification.isPending && (
          <section className="bg-surface-container-low rounded-[16px] p-8 border border-surface-container-high/60 min-h-[180px] flex flex-col justify-center items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-secondary-container/60 text-stitch-primary flex items-center justify-center shadow-sm">
              <Lightbulb className="w-7 h-7" />
            </div>
            <p className="text-sm md:text-base text-on-surface-variant max-w-sm leading-relaxed">
              Your simplified explanation will appear here.
            </p>
          </section>
        )}

        {/* Loading State */}
        {simplification.isPending && (
          <section className="bg-surface-container-lowest rounded-[16px] p-8 border border-surface-container-low shadow-sm space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container/30"></div>
              <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
            </div>
            <div className="space-y-2.5">
              <div className="h-3.5 bg-surface-container-low rounded w-full"></div>
              <div className="h-3.5 bg-surface-container-low rounded w-5/6"></div>
              <div className="h-3.5 bg-surface-container-low rounded w-4/6"></div>
            </div>
          </section>
        )}

        {/* Generated Simplification Comparison Result */}
        {result && (
          <section className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Original Text Panel */}
              <div className="bg-surface-container-lowest rounded-[16px] p-5 md:p-6 border border-surface-container-low shadow-[0px_4px_20px_rgba(0,0,0,0.04)] space-y-3 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Original Text
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-low text-on-surface-variant capitalize">
                    {textType}
                  </span>
                </div>
                <div className="flex-1 text-sm md:text-base text-on-surface-variant leading-relaxed overflow-y-auto max-h-72 whitespace-pre-wrap">
                  {text}
                </div>
              </div>

              {/* Plain Language Panel */}
              <div className="bg-surface-container-lowest rounded-[16px] p-5 md:p-6 border-2 border-primary-container/30 shadow-[0px_8px_30px_rgba(0,0,0,0.06)] space-y-3 flex flex-col relative">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                  <span className="text-xs font-bold uppercase tracking-wider text-stitch-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Plain Language
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-on-surface-variant" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex-1 text-sm md:text-base font-medium text-on-surface leading-relaxed overflow-y-auto max-h-72 whitespace-pre-wrap">
                  {result.plain_language}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Watch Out For Section */}
        <section className="space-y-4 pt-2">
          <h3 className="text-xl font-bold text-on-surface flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-error-stitch" />
            <span>Watch Out For</span>
          </h3>

          {/* If dynamic AI results are available */}
          {result && result.watch_out_for.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.watch_out_for.map((item, index) => {
                const categoryLower = item.category.toLowerCase()
                const isFee = categoryLower.includes('fee')
                const isDeadline = categoryLower.includes('deadline')

                let bgClass = 'bg-tertiary-container/10 border-tertiary-container/30'
                let badgeClass = 'bg-tertiary-container text-white'
                let IconComponent = Gavel

                if (isFee) {
                  bgClass = 'bg-error-container/20 border-error-container/60'
                  badgeClass = 'bg-error text-white'
                  IconComponent = Coins
                } else if (isDeadline) {
                  bgClass = 'bg-secondary-container/30 border-secondary-container'
                  badgeClass = 'bg-stitch-primary text-white'
                  IconComponent = Calendar
                }

                return (
                  <div
                    key={index}
                    className={`${bgClass} rounded-[14px] p-4 border flex items-start space-x-3.5 shadow-sm transition-all hover:shadow-md`}
                  >
                    <div className={`p-2 ${badgeClass} rounded-full shrink-0 shadow-sm`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-on-surface leading-tight">
                          {item.title}
                        </h4>
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : result && result.watch_out_for.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200">
              No critical watch-out items (fees, penalties, or deadlines) detected in this text.
            </div>
          ) : (
            /* Default informative preview cards matching screen.png & code.html */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fee Card */}
              <div className="bg-error-container/20 rounded-[14px] p-4 border border-error-container/50 flex items-start space-x-3.5 hover:shadow-md transition-shadow">
                <div className="p-2 bg-error text-white rounded-full shrink-0 shadow-sm">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Hidden Fees</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Look for recurring charges or penalties.
                  </p>
                </div>
              </div>

              {/* Deadline Card */}
              <div className="bg-secondary-container/30 rounded-[14px] p-4 border border-secondary-container flex items-start space-x-3.5 hover:shadow-md transition-shadow">
                <div className="p-2 bg-stitch-primary text-white rounded-full shrink-0 shadow-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Deadlines</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Check for strict notice periods or expiry dates.
                  </p>
                </div>
              </div>

              {/* Penalty Card */}
              <div className="bg-tertiary-container/15 rounded-[14px] p-4 border border-tertiary-container/40 flex items-start space-x-3.5 hover:shadow-md transition-shadow">
                <div className="p-2 bg-tertiary text-white rounded-full shrink-0 shadow-sm">
                  <Gavel className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Penalties</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Identify consequences for breach of terms.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Legal & Financial Safety Disclaimer Banner */}
        <section className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface-variant flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-on-surface">Important:</strong> Studdy AI explains difficult text in simpler language. It does not replace professional legal or financial advice.
          </p>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only matching screen.png) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-surface/95 backdrop-blur-md shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] border-t border-surface-container-low/80 z-50 md:hidden">
        {/* Home */}
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1 leading-none">Home</span>
        </Link>
        {/* Practice */}
        <Link
          to="/practice"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1 leading-none">Practice</span>
        </Link>
        {/* Simplify (Active) */}
        <Link
          to="/simplify"
          className="flex flex-col items-center justify-center bg-secondary-container text-stitch-primary rounded-xl px-4 py-2 active:scale-95 transition-transform duration-150 w-16"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-1 leading-none">Simplify</span>
        </Link>
        {/* Profile */}
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1 leading-none">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
