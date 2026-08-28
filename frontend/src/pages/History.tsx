import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useUser, UserButton } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  getLocalSessions,
  getLocalSessionDetails,
  deleteLocalSession,
} from '@/services/localStorageSessions'
import {
  Menu,
  X,
  Sparkles,
  Home,
  HelpCircle,
  BookOpen,
  User,
  FileText,
  Search,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react'

const HAS_CLERK_KEY = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
const HAS_CONVEX_URL = Boolean(import.meta.env.VITE_CONVEX_URL)

export function History() {
  const authUser = HAS_CLERK_KEY ? useUser() : null
  const user = authUser?.user
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [localVersion, setLocalVersion] = useState(0)

  const convexSessions = HAS_CONVEX_URL && user ? useQuery(api.sessions.listMine) : []
  const removeMutation = HAS_CONVEX_URL && user ? useMutation(api.sessions.remove) : null

  const [searchParams] = useSearchParams()
  const sessionParam = searchParams.get('session')

  const [filter, setFilter] = useState<'all' | 'practice_questions' | 'simplification'>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(sessionParam)

  useEffect(() => {
    if (sessionParam) setSelectedId(sessionParam)
  }, [sessionParam])

  const isConvexSelected = Boolean(
    selectedId && !selectedId.startsWith('local_') && HAS_CONVEX_URL && user
  )
  const convexDetails = useQuery(
    api.sessions.getDetails,
    isConvexSelected ? { sessionId: selectedId as never } : 'skip'
  )

  const localDetails = useMemo(() => {
    if (selectedId) {
      return getLocalSessionDetails(selectedId)
    }
    return null
  }, [selectedId, localVersion])

  const selectedDetails = isConvexSelected ? convexDetails : localDetails

  const allSessions = useMemo(() => {
    const locals = getLocalSessions()
    const convex = (convexSessions || []).map((s) => ({
      _id: s._id as string,
      type: s.type,
      title: s.title,
      sourceText: s.sourceText,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }))

    const combined = [...locals]
    for (const c of convex) {
      if (!combined.some((l) => l._id === c._id)) {
        combined.push(c)
      }
    }
    return combined.sort((a, b) => b.createdAt - a.createdAt)
  }, [convexSessions, localVersion])

  const visible = allSessions.filter(
    (session) =>
      (filter === 'all' || session.type === filter) &&
      `${session.title} ${session.sourceText}`.toLowerCase().includes(search.toLowerCase())
  )

  const deleteSession = async (id: string) => {
    if (window.confirm('Delete this study session? This cannot be undone.')) {
      if (id.startsWith('local_')) {
        deleteLocalSession(id)
      } else if (removeMutation) {
        try {
          await removeMutation({ sessionId: id as never })
        } catch {
          // ignore remote delete error
        }
        deleteLocalSession(id)
      } else {
        deleteLocalSession(id)
      }
      setLocalVersion((v) => v + 1)
      if (selectedId === id) setSelectedId(null)
    }
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
            Practice
          </Link>
          <Link to="/simplify" className="hover:text-stitch-primary transition-colors">
            Simplify
          </Link>
          <Link to="/history" className="text-stitch-primary font-semibold transition-colors">
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
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low font-medium text-sm transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-stitch-primary" />
                  <span>Plain Language</span>
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-semibold text-sm transition-colors"
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
        <section className="space-y-1.5">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
            Study History
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant">
            Review and revisit your saved practice questions and plain language explanations.
          </p>
        </section>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions by title or topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
              aria-label="Search study sessions"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                ['all', 'All'],
                ['practice_questions', 'Practice Sets'],
                ['simplification', 'Simplifications'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setFilter(val)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === val
                    ? 'bg-secondary-container text-stitch-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-surface-container-high'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* History Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sessions List */}
          <div className={selectedId ? 'lg:col-span-6 space-y-3' : 'lg:col-span-12 space-y-3'}>
            {convexSessions === undefined && allSessions.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high">
                <p className="text-sm text-on-surface-variant">Loading your study history...</p>
              </div>
            ) : visible.length === 0 ? (
              <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/60 space-y-2">
                <Layers className="w-8 h-8 mx-auto text-on-surface-variant/60" />
                <h4 className="font-semibold text-sm text-on-surface">No sessions found</h4>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                  {search ? 'Try adjusting your search query or filter.' : 'Your generated study sessions will appear here automatically.'}
                </p>
              </div>
            ) : (
              visible.map((session) => {
                const isPractice = session.type === 'practice_questions'
                const isSelected = selectedId === session._id

                return (
                  <article
                    key={session._id}
                    onClick={() => setSelectedId(session._id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                      isSelected
                        ? 'bg-secondary-container/20 border-primary-container shadow-sm'
                        : 'bg-surface-container-lowest border-surface-container-high hover:border-outline-variant hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isPractice
                            ? 'bg-secondary-container text-stitch-primary'
                            : 'bg-secondary-fixed text-on-secondary-fixed'
                        }`}
                      >
                        {isPractice ? <HelpCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-semibold text-sm text-on-surface truncate group-hover:text-stitch-primary transition-colors">
                          {session.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant truncate">
                          {session.sourceText.slice(0, 90)}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant/70 pt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{isPractice ? '10 Questions' : 'Simplification'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          void deleteSession(session._id)
                        }}
                        className="p-2 rounded-lg text-on-surface-variant/70 hover:text-error hover:bg-error-container/20 transition-colors"
                        title="Delete session"
                        aria-label={`Delete ${session.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant/40 group-hover:text-stitch-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </article>
                )
              })
            )}
          </div>

          {/* Session Detail Drawer / Card */}
          {selectedDetails && (
            <aside className="lg:col-span-6 bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-[0px_4px_20px_rgba(0,0,0,0.04)] space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stitch-primary">
                    Session Details
                  </span>
                  <h3 className="text-lg font-bold text-on-surface mt-0.5">
                    {selectedDetails.session.title}
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(selectedDetails.session.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Questions if practice */}
              {selectedDetails.questions && selectedDetails.questions.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Saved Questions ({selectedDetails.questions.length})
                  </h4>
                  {selectedDetails.questions.map((q) => (
                    <div
                      key={q._id}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs space-y-1.5"
                    >
                      <p className="font-semibold text-on-surface text-sm">
                        {q.questionNumber}. {q.question}
                      </p>
                      <div className="flex items-center gap-1.5 text-stitch-primary font-medium">
                        <span>Answer:</span>
                        <span className="text-on-surface">{q.correctAnswer}</span>
                      </div>
                      {q.explanation && (
                        <p className="text-on-surface-variant text-[11px] leading-relaxed pt-1">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Plain language if simplification */}
              {selectedDetails.simplification && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Plain Language Explanation
                  </h4>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high text-xs md:text-sm text-on-surface leading-relaxed max-h-80 overflow-y-auto">
                    {selectedDetails.simplification.plainLanguage}
                  </div>
                </div>
              )}

              {/* Detail Actions */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => void deleteSession(selectedDetails.session._id)}
                  className="text-xs font-semibold text-error hover:bg-error-container/30 px-4 py-2 rounded-xl border border-error-container flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Session</span>
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-surface/95 backdrop-blur-md shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] border-t border-surface-container-low/80 z-50 md:hidden">
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Home</span>
        </Link>
        <Link
          to="/practice"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Practice</span>
        </Link>
        <Link
          to="/simplify"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Simplify</span>
        </Link>
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
