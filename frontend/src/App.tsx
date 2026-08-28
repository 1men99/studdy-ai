import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  Highlighter,
  Link,
  Mail,
  Menu,
  PlayCircle,
  Quote,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { SignedIn, SignedOut, SignIn, SignInButton, SignUp, SignUpButton, UserButton, useUser, useAuth } from '@clerk/clerk-react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'
import { Practice } from '@/pages/Practice'
import { Simplify } from '@/pages/Simplify'
import { Dashboard } from '@/pages/Dashboard'
import { History } from '@/pages/History'
import { Profile } from '@/pages/Profile'
import './App.css'

const HAS_CLERK_KEY = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

function AuthActions() {
  const { user } = useUser()
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal" fallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
          <button className="nav-login" type="button">Log In</button>
        </SignInButton>
        <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard" signInFallbackRedirectUrl="/dashboard">
          <button className="button primary nav-cta" type="button">Get Started</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <span className="welcome-user">{user?.firstName || 'Student'}</span>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  )
}
function Nav() { const [open, setOpen] = useState(false); return <nav className="site-nav"><div className="nav-inner"><a className="brand" href="#top"><BookOpen size={24} /> <span>Studdy AI</span></a><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation" type="button">{open ? <X size={20} /> : <Menu size={20} />}</button><div className={`nav-links ${open ? 'open' : ''}`}><a href="#features">Features</a><a href="#how-it-works">How it Works</a><a href="#testimonials">Testimonials</a></div><div className="nav-actions">{HAS_CLERK_KEY ? <AuthActions /> : <><a className="nav-login" href="/sign-in">Log In</a><a className="button primary nav-cta" href="/sign-up">Get Started</a></>}</div></div></nav> }
function Preview() { return <div className="preview-frame"><div className="preview-window"><aside><div className="preview-mark"><BookOpen size={12} /></div>{[1,2,3,4,5].map((n) => <i className={n === 1 ? 'short' : ''} key={n} />)}</aside><div className="preview-main"><div className="preview-topline">My Study Dashboard <b /></div><strong className="preview-title">Biology Fundamentals - Quiz 1</strong><div className="preview-progress"><span /></div><strong>Which organelle is responsible for energy production?</strong>{['Nucleus','Mitochondria','Ribosome'].map((a, i) => <div className={`preview-answer ${i === 1 ? 'selected' : ''}`} key={a}> {String.fromCharCode(65+i)}. {a} {i === 1 && <CheckCircle2 size={11} />}</div>)}</div><div className="preview-stats">Score<strong>8/10</strong><small>Great work!</small></div></div><div className="generated"><CheckCircle2 size={18} /><span><b>Quiz Generated</b><small>Biology 101 - 10 questions</small></span></div></div> }
function Hero() { return <section className="hero" id="top"><div className="content-grid hero-grid"><div className="hero-copy"><div className="eyebrow"><Zap size={12} /> Study Smarter, Not Harder</div><h1>Master your courses with <span>AI-powered</span> study tools.</h1><p>Turn complex notes into practice quizzes and simplify difficult text in seconds. Reclaim your time and boost your grades with the ultimate academic companion.</p><div className="hero-buttons">{HAS_CLERK_KEY ? <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard" signInFallbackRedirectUrl="/dashboard"><button className="button primary" type="button">Get Started for Free <ArrowRight size={15} /></button></SignUpButton> : <a className="button primary" href="/sign-up">Get Started for Free <ArrowRight size={15} /></a>}<a className="button secondary" href="#how-it-works"><PlayCircle size={15} /> See how it works</a></div><div className="student-proof"><div className="avatars"><span>A</span><span>B</span><span>C</span></div><p>Join <b>10,000+</b> students studying smarter today.</p></div></div><Preview /></div></section> }
function Features() { return <section className="section features" id="features"><Heading title="Supercharge your study sessions" text="Everything you need to turn overwhelming course material into digestible, actionable study plans." /><div className="feature-grid"><article className="feature-card large"><div><Icon color="blue"><FileText /></Icon><h3>Practice Question Generator</h3><p>Instantly convert dense lecture notes into comprehensive Multiple Choice, True/False, and short-answer questions tailored to your syllabus.</p></div><div className="sample"><small><Sparkles size={10} /> Sample Question generated from notes</small><b>What is the primary function of mitochondria?</b><span>A. Protein synthesis</span><span className="correct">B. Energy production (ATP) <CheckCircle2 size={11} /></span></div></article><article className="feature-card"><Icon color="slate"><BookOpen /></Icon><h3>Plain Language Tool</h3><p>Simplify dense academic textbooks, complex legal contracts, and impenetrable jargon into clear, easy-to-read text in seconds.</p><div className="before-after"><label>Before</label><span>In accordance with the aforementioned stipulations...</span><ArrowDown /><strong>Based on the rules we just agreed on...</strong></div></article><article className="feature-card"><Icon color="gray"><Highlighter /></Icon><h3>Smart Highlights</h3><p>Automatically scan syllabi and documents to highlight crucial dates, fees, deadlines, and potential risks so you never miss a detail.</p><div className="chips"><span>Deadlines</span><span>Fees</span><span>Reading Prep</span></div></article><article className="feature-cta"><div><h3>Ready to ace your next exam?</h3><p>Join thousands of students who have upgraded their study routine.</p></div><a className="button light" href="/sign-up">Start for free today</a></article></div></section> }
function Icon({ color, children }: { color: string; children: React.ReactNode }) { return <div className={`feature-icon ${color}`}>{children}</div> }
function Heading({ title, text }: { title: string; text: string }) { return <div className="section-heading"><h2>{title}</h2><p>{text}</p></div> }
function Steps() { const steps = [{icon:<ClipboardPaste />, title:'Paste your notes', text:'Upload documents, paste raw text, or link directly to your digital notebook. Studdy handles almost any format.'},{icon:<BrainCircuit />, title:'AI analyzes content', text:'Our academic models instantly structure the data, extract key concepts, and generate custom study materials.'},{icon:<span className="grade">A+</span>, title:'Study smarter', text:"Review flashcards, take practice tests, and read simplified summaries designed specifically for your brain's retention."}]; return <section className="section steps" id="how-it-works"><Heading title="From chaos to clarity in 3 steps" text="Our AI workflow is designed to minimize setup time so you can focus on actual learning." /><div className="steps-list">{steps.map((s,i)=><div className={`step step-${i}`} key={s.title}><div className="step-visual">{s.icon}<i /><i /></div><div className="step-number">{i+1}</div><div className="step-copy"><h3>{s.title}</h3><p>{s.text}</p></div></div>)}</div></section> }
function Testimonial() { return <section className="section testimonial" id="testimonials"><div className="quote-card"><Quote className="quote-mark" size={90} fill="currentColor" /><div className="stars">{[1,2,3,4,5].map(n=><Star key={n} size={13} fill="currentColor" />)}</div><blockquote>"Studdy AI completely changed how I prepare for exams. I used to spend hours just organizing my notes and trying to figure out what was important. Now, I paste my lectures in, and it generates perfect practice quizzes that highlight exactly what I need to know. It saved me hours of prep for my Biology finals!"</blockquote><div className="person"><span>SJ</span><b>Sarah Jenkins<small>Pre-Med Student, University of Michigan</small></b></div></div></section> }
function Footer() { return <footer><div className="footer-grid"><div className="footer-about"><a className="brand" href="#top"><BookOpen size={20} /> Studdy AI</a><p>Join thousands of students studying smarter. Master your courses with AI-powered tools designed for modern academia.</p><div className="socials"><a href="mailto:hello@studdy.ai"><Mail size={14} /></a><a href="#top"><Link size={14} /></a></div></div><div><h4>Product</h4><a href="#features">Features</a><a href="#top">Pricing</a><a href="#top">For Universities</a><a href="#top">Changelog</a></div><div><h4>Legal</h4><a href="#top">Privacy Policy</a><a href="#top">Terms of Service</a><a href="#top">Academic Integrity</a><a href="mailto:hello@studdy.ai">Contact Us</a></div></div><div className="footer-bottom"><span>© 2024 Studdy AI Inc. All rights reserved.</span><span>Designed for focus.</span></div></footer> }
function AuthSetupMessage({ mode }: { mode: 'sign-in' | 'sign-up' }) { const isSignIn = mode === 'sign-in'; return <div className="auth-setup"><Sparkles size={20} /><h3>{isSignIn ? 'Sign-in is ready to connect' : 'Account creation is ready to connect'}</h3><p>Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>frontend/.env.local</code> to activate live Clerk authentication.</p><a className="button primary" href="/">Return to home</a></div> }

function AuthPageContent({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const isSignIn = mode === 'sign-in'
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <a className="brand auth-brand" href="/">
          <BookOpen size={24} /> Studdy AI
        </a>
        <div className="auth-copy">
          <div className="eyebrow">
            <Zap size={12} /> Study Smarter, Not Harder
          </div>
          <h1>
            {isSignIn
              ? 'Welcome back to smarter studying.'
              : 'Build a better study routine.'}
          </h1>
          <p>
            {isSignIn
              ? 'Pick up where you left off and turn your course material into clear, useful study tools.'
              : 'Join thousands of students turning overwhelming course material into focused study sessions.'}
          </p>
          <ul>
            <li>
              <CheckCircle2 size={16} /> Practice with AI-generated questions
            </li>
            <li>
              <CheckCircle2 size={16} /> Make difficult text easier to
              understand
            </li>
            <li>
              <CheckCircle2 size={16} /> Keep every study session in one
              place
            </li>
          </ul>
        </div>
        <div className="auth-footer-note">
          Designed for focus. Built for students.
        </div>
      </div>
      <div className="auth-form-area">
        <div className="auth-form-top">
          <a href="/">Back to home</a>
        </div>
        <div className="auth-form-card">
          <div className="auth-form-heading">
            <span className="auth-form-icon">
              <Sparkles size={17} />
            </span>
            <h2>
              {isSignIn
                ? 'Sign in to Studdy AI'
                : 'Create your Studdy AI account'}
            </h2>
            <p>
              {isSignIn
                ? 'Continue your learning journey.'
                : 'Start studying with more clarity today.'}
            </p>
          </div>
          {HAS_CLERK_KEY ? (
            isSignIn ? (
              <SignIn
                routing="path"
                path="/sign-in"
                appearance={authAppearance}
                fallbackRedirectUrl="/dashboard"
                signUpFallbackRedirectUrl="/dashboard"
                forceRedirectUrl="/dashboard"
              />
            ) : (
              <SignUp
                routing="path"
                path="/sign-up"
                appearance={authAppearance}
                fallbackRedirectUrl="/dashboard"
                signInFallbackRedirectUrl="/dashboard"
                forceRedirectUrl="/dashboard"
              />
            )
          ) : (
            <AuthSetupMessage mode={mode} />
          )}
        </div>
      </div>
    </div>
  )
}

function AuthPageWithAuth({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }
  return <AuthPageContent mode={mode} />
}

function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  if (!HAS_CLERK_KEY) {
    return <AuthPageContent mode={mode} />
  }
  return <AuthPageWithAuth mode={mode} />
}

const authAppearance = { variables: { colorPrimary: '#2563eb', colorText: '#131b2e', colorTextSecondary: '#606477', colorBackground: '#ffffff', borderRadius: '8px', fontFamily: 'Inter, sans-serif' }, elements: { card: 'auth-clerk-card', headerTitle: 'auth-clerk-title', headerSubtitle: 'auth-clerk-subtitle', formButtonPrimary: 'auth-clerk-button', formFieldInput: 'auth-clerk-input', footerActionLink: 'auth-clerk-link', socialButtonsBlockButton: 'auth-clerk-social' } }

function LandingPageContent() {
  return (
    <div className="landing-page">
      <Nav />
      <main>
        <Hero />
        <Features />
        <Steps />
        <Testimonial />
      </main>
      <Footer />
    </div>
  )
}

function HomePageWithAuth() {
  const { isLoaded, isSignedIn } = useAuth()
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }
  return <LandingPageContent />
}

function HomePage() {
  if (!HAS_CLERK_KEY) {
    return <LandingPageContent />
  }
  return <HomePageWithAuth />
}
export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sign-in" element={<AuthPage mode="sign-in" />} />
          <Route path="/sign-up" element={<AuthPage mode="sign-up" />} />
          <Route
            path="/profile/*"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simplify"
            element={
              <ProtectedRoute>
                <Simplify />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ErrorBoundary>
  )
}
export default App