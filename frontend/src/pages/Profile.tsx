import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserProfile, UserButton, useUser } from '@clerk/clerk-react'
import {
  Menu,
  X,
  Sparkles,
  Home,
  HelpCircle,
  BookOpen,
  User,
  FileText,
} from 'lucide-react'

export function Profile() {
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

      {/* Main Content */}
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-6 md:py-10 max-w-4xl mx-auto w-full space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
            Account & Preferences
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant">
            Manage your personal profile, authentication methods, and security settings.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-container-low overflow-hidden p-2 sm:p-6">
          <UserProfile
            routing="path"
            path="/profile"
            appearance={{
              variables: {
                colorPrimary: '#004ac6',
                colorText: '#131b2e',
                colorBackground: '#ffffff',
                borderRadius: '0.75rem',
              },
            }}
          />
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
          className="flex flex-col items-center justify-center bg-secondary-container text-stitch-primary rounded-xl px-4 py-2 active:scale-95 transition-transform duration-150 w-16"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-semibold leading-none">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
