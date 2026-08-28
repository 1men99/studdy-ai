import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { useUser, UserButton } from '@clerk/clerk-react'
import {
  Menu,
  X,
  HelpCircle,
  BookOpen,
  ChevronRight,
  Home,
  FileQuestion,
  Sparkles,
  History as HistoryIcon,
  FlaskConical,
  FileText,
  User,
} from 'lucide-react'
import { api } from '../../convex/_generated/api'

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours === 1) return '1h ago'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getGreeting(name?: string | null): string {
  const hour = new Date().getHours()
  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon'
  } else if (hour >= 17 || hour < 5) {
    greeting = 'Good evening'
  }
  return `${greeting}, ${name || 'Student'}`
}

import { getLocalSessions } from '@/services/localStorageSessions'

const HAS_CLERK_KEY = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
const HAS_CONVEX_URL = Boolean(import.meta.env.VITE_CONVEX_URL)

export function Dashboard() {
  const authUser = HAS_CLERK_KEY ? useUser() : null
  const user = authUser?.user
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const convexSessions = HAS_CONVEX_URL && user ? useQuery(api.sessions.listMine) : []

  const sessions = useMemo(() => {
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
  }, [convexSessions])

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
          <Link to="/dashboard" className="text-stitch-primary font-semibold transition-colors">
            Dashboard
          </Link>
          <Link to="/practice" className="hover:text-stitch-primary transition-colors">
            Practice Questions
          </Link>
          <Link to="/simplify" className="hover:text-stitch-primary transition-colors">
            Plain Language
          </Link>
          <Link to="/history" className="hover:text-stitch-primary transition-colors">
            Study History
          </Link>
        </nav>

        {/* User Profile Area */}
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
        <div className="fixed inset-0 z-30 bg-on-surface/20 backdrop-blur-sm md:hidden animate-in fade-in" onClick={() => setMobileMenuOpen(false)}>
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
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-semibold text-sm transition-colors"
                >
                  <Home className="w-5 h-5 text-stitch-primary" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/practice"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low font-medium text-sm transition-colors"
                >
                  <FileQuestion className="w-5 h-5 text-stitch-primary" />
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
                  <HistoryIcon className="w-5 h-5 text-stitch-primary" />
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

      {/* Main Canvas */}
      <main className="flex-1 px-margin-mobile pt-6 pb-xl max-w-md mx-auto w-full md:max-w-4xl md:px-margin-desktop md:pt-10">
        {/* Greeting */}
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-1">
            {getGreeting(user?.firstName)}
          </h2>
          <p className="text-base text-on-surface-variant">
            What would you like to focus on today?
          </p>
        </section>

        {/* Tools Grid */}
        <section className="flex flex-col gap-6 md:flex-row md:gap-gutter mb-12">
          {/* Card 1: Practice Questions */}
          <div className="bg-surface-container-lowest p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-container-low flex flex-col hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 w-full flex-1 group">
            <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md shadow-primary-container/20">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">
              Practice Questions
            </h3>
            <p className="text-sm md:text-base text-on-surface-variant mb-6 flex-grow leading-relaxed">
              Turn your class notes into practice questions.
            </p>
            <button
              onClick={() => navigate('/practice')}
              className="w-full h-[48px] bg-stitch-primary text-white rounded-full font-medium text-sm md:text-base flex items-center justify-center hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              Create Questions
            </button>
          </div>

          {/* Card 2: Plain Language */}
          <div className="bg-surface-container-lowest p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-container-low flex flex-col hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 w-full flex-1 group">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-stitch-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-stitch-primary" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">
              Plain Language
            </h3>
            <p className="text-sm md:text-base text-on-surface-variant mb-6 flex-grow leading-relaxed">
              Make difficult paragraphs, bills, or contracts easier to understand.
            </p>
            <button
              onClick={() => navigate('/simplify')}
              className="w-full h-[48px] bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-full font-medium text-sm md:text-base flex items-center justify-center hover:bg-surface-container-high active:scale-[0.98] transition-all cursor-pointer"
            >
              Simplify Text
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-on-surface">
              Recent Activity
            </h3>
            {sessions && sessions.length > 0 && (
              <Link to="/history" className="text-xs font-semibold text-stitch-primary hover:underline">
                View All ({sessions.length})
              </Link>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-container-low p-2">
            {sessions === undefined ? (
              <div className="p-8 text-center space-y-2 animate-pulse">
                <div className="h-4 bg-surface-container-high rounded w-1/3 mx-auto"></div>
                <div className="h-3 bg-surface-container-low rounded w-1/2 mx-auto"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-low text-on-surface-variant mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-on-surface-variant" />
                </div>
                <p className="text-sm font-semibold text-on-surface">No study sessions yet</p>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                  Generate your first quiz or simplify difficult text above to see your history here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-surface-container-high">
                {sessions.slice(0, 5).map((session) => {
                  const isPractice = session.type === 'practice_questions'
                  return (
                    <div
                      key={session._id}
                      onClick={() => navigate(`/history?session=${session._id}`)}
                      className="flex items-center gap-4 p-4 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          isPractice
                            ? 'bg-primary-container text-white'
                            : 'bg-secondary-container text-stitch-primary'
                        }`}
                      >
                        {isPractice ? (
                          <FlaskConical className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate group-hover:text-stitch-primary transition-colors">
                          {session.title || (isPractice ? 'Practice Quiz' : 'Text Simplification')}
                        </p>
                        <p className="text-xs text-on-surface-variant font-normal">
                          {isPractice ? 'Last practice' : 'Simplified'} • {formatRelativeTime(session.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-outline-variant group-hover:text-stitch-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only matching screen.png) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-surface/95 backdrop-blur-md shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] border-t border-surface-container-low/80 z-50 md:hidden">
        {/* Active: Home */}
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center bg-secondary-container text-stitch-primary rounded-xl px-4 py-2 active:scale-95 transition-transform duration-150 w-16"
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-1 leading-none">Home</span>
        </Link>
        {/* Practice */}
        <Link
          to="/practice"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1 leading-none">Practice</span>
        </Link>
        {/* Simplify */}
        <Link
          to="/simplify"
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-stitch-primary active:scale-95 transition-transform duration-150 w-16"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1 leading-none">Simplify</span>
        </Link>
        {/* Profile / History */}
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
