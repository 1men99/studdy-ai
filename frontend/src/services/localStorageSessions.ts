import type { PracticeQuestion, SimplifyResult } from '@/types'

export type LocalSession = {
  _id: string
  type: 'practice_questions' | 'simplification'
  title: string
  sourceText: string
  status: 'completed' | 'pending' | 'failed'
  createdAt: number
  updatedAt: number
}

export type LocalQuestion = {
  _id: string
  sessionId: string
  questionNumber: number
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer'
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  createdAt: number
}

export type LocalAnswer = {
  _id: string
  sessionId: string
  questionId: string
  userAnswer: string
  isCorrect: boolean
  answeredAt: number
}

export type LocalSimplification = {
  _id: string
  sessionId: string
  originalText: string
  plainLanguage: string
  createdAt: number
}

export type LocalWatchOut = {
  _id: string
  simplificationId: string
  category: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'alert'
  createdAt: number
}

const STORAGE_KEYS = {
  SESSIONS: 'studdy_sessions',
  QUESTIONS: 'studdy_questions',
  ANSWERS: 'studdy_answers',
  SIMPLIFICATIONS: 'studdy_simplifications',
  WATCH_OUTS: 'studdy_watch_outs',
}

function getItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setItem<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Ignore storage quota errors
  }
}

export function getLocalSessions(): LocalSession[] {
  return getItem<LocalSession>(STORAGE_KEYS.SESSIONS).sort(
    (a, b) => b.createdAt - a.createdAt
  )
}

export function saveLocalPracticeSession(
  notes: string,
  questions: PracticeQuestion[]
): { sessionId: string; questionIds: Map<string, string> } {
  const now = Date.now()
  const sessionId = `local_sess_${now}_${Math.random().toString(36).slice(2, 7)}`

  const firstLine = notes.trim().split('\n')[0].trim().replace(/^#+\s*/, '')
  const title =
    firstLine.length > 3 && firstLine.length < 40
      ? `${firstLine} Practice`
      : 'Practice Questions'

  const newSession: LocalSession = {
    _id: sessionId,
    type: 'practice_questions',
    title,
    sourceText: notes,
    status: 'completed',
    createdAt: now,
    updatedAt: now,
  }

  const sessions = getItem<LocalSession>(STORAGE_KEYS.SESSIONS)
  setItem(STORAGE_KEYS.SESSIONS, [newSession, ...sessions])

  const existingQuestions = getItem<LocalQuestion>(STORAGE_KEYS.QUESTIONS)
  const questionIds = new Map<string, string>()
  const newQuestions: LocalQuestion[] = []

  for (const [index, q] of questions.entries()) {
    const qId = `local_q_${now}_${index}_${Math.random().toString(36).slice(2, 6)}`
    questionIds.set(q.id || String(index), qId)

    newQuestions.push({
      _id: qId,
      sessionId,
      questionNumber: index + 1,
      type: q.type,
      question: q.question,
      options: q.options || [],
      correctAnswer: q.answer,
      explanation: q.explanation || '',
      createdAt: now,
    })
  }

  setItem(STORAGE_KEYS.QUESTIONS, [...newQuestions, ...existingQuestions])
  return { sessionId, questionIds }
}

export function recordLocalAnswer(
  sessionId: string,
  questionId: string,
  answer: string,
  isCorrect: boolean
) {
  const now = Date.now()
  const newAnswer: LocalAnswer = {
    _id: `local_ans_${now}_${Math.random().toString(36).slice(2, 6)}`,
    sessionId,
    questionId,
    userAnswer: answer,
    isCorrect,
    answeredAt: now,
  }

  const answers = getItem<LocalAnswer>(STORAGE_KEYS.ANSWERS)
  setItem(STORAGE_KEYS.ANSWERS, [newAnswer, ...answers])
}

export function saveLocalSimplificationSession(
  text: string,
  result: SimplifyResult
): string {
  const now = Date.now()
  const sessionId = `local_sess_${now}_${Math.random().toString(36).slice(2, 7)}`

  const firstLine = text.trim().split('\n')[0].trim()
  const title =
    firstLine.length > 3 && firstLine.length < 40
      ? `${firstLine} Summary`
      : 'Plain-language explanation'

  const newSession: LocalSession = {
    _id: sessionId,
    type: 'simplification',
    title,
    sourceText: text,
    status: 'completed',
    createdAt: now,
    updatedAt: now,
  }

  const sessions = getItem<LocalSession>(STORAGE_KEYS.SESSIONS)
  setItem(STORAGE_KEYS.SESSIONS, [newSession, ...sessions])

  const simplificationId = `local_simp_${now}_${Math.random().toString(36).slice(2, 6)}`
  const newSimp: LocalSimplification = {
    _id: simplificationId,
    sessionId,
    originalText: text,
    plainLanguage: result.plain_language,
    createdAt: now,
  }

  const simplifications = getItem<LocalSimplification>(STORAGE_KEYS.SIMPLIFICATIONS)
  setItem(STORAGE_KEYS.SIMPLIFICATIONS, [newSimp, ...simplifications])

  if (result.watch_out_for && result.watch_out_for.length > 0) {
    const existingWatchOuts = getItem<LocalWatchOut>(STORAGE_KEYS.WATCH_OUTS)
    const newWatchOuts: LocalWatchOut[] = result.watch_out_for.map((w, idx) => ({
      _id: `local_wo_${now}_${idx}`,
      simplificationId,
      category: w.category,
      title: w.title,
      description: w.description,
      severity: w.severity || 'info',
      createdAt: now,
    }))
    setItem(STORAGE_KEYS.WATCH_OUTS, [...newWatchOuts, ...existingWatchOuts])
  }

  return sessionId
}

export function getLocalSessionDetails(sessionId: string): {
  session: LocalSession
  questions?: LocalQuestion[]
  simplification?: LocalSimplification
  watchOutItems?: LocalWatchOut[]
} | null {
  const sessions = getItem<LocalSession>(STORAGE_KEYS.SESSIONS)
  const session = sessions.find((s) => s._id === sessionId)
  if (!session) return null

  if (session.type === 'practice_questions') {
    const allQuestions = getItem<LocalQuestion>(STORAGE_KEYS.QUESTIONS)
    const questions = allQuestions
      .filter((q) => q.sessionId === sessionId)
      .sort((a, b) => a.questionNumber - b.questionNumber)
    return { session, questions }
  }

  if (session.type === 'simplification') {
    const allSimps = getItem<LocalSimplification>(STORAGE_KEYS.SIMPLIFICATIONS)
    const simplification = allSimps.find((s) => s.sessionId === sessionId)
    const allWatchOuts = getItem<LocalWatchOut>(STORAGE_KEYS.WATCH_OUTS)
    const watchOutItems = simplification
      ? allWatchOuts.filter((w) => w.simplificationId === simplification._id)
      : []

    return { session, simplification, watchOutItems }
  }

  return { session }
}

export function deleteLocalSession(sessionId: string) {
  const sessions = getItem<LocalSession>(STORAGE_KEYS.SESSIONS).filter(
    (s) => s._id !== sessionId
  )
  setItem(STORAGE_KEYS.SESSIONS, sessions)

  const questions = getItem<LocalQuestion>(STORAGE_KEYS.QUESTIONS).filter(
    (q) => q.sessionId !== sessionId
  )
  setItem(STORAGE_KEYS.QUESTIONS, questions)

  const answers = getItem<LocalAnswer>(STORAGE_KEYS.ANSWERS).filter(
    (a) => a.sessionId !== sessionId
  )
  setItem(STORAGE_KEYS.ANSWERS, answers)

  const simplifications = getItem<LocalSimplification>(STORAGE_KEYS.SIMPLIFICATIONS)
  const targetSimps = simplifications.filter((s) => s.sessionId === sessionId)
  const targetSimpIds = new Set(targetSimps.map((s) => s._id))
  setItem(
    STORAGE_KEYS.SIMPLIFICATIONS,
    simplifications.filter((s) => s.sessionId !== sessionId)
  )

  const watchOuts = getItem<LocalWatchOut>(STORAGE_KEYS.WATCH_OUTS).filter(
    (w) => !targetSimpIds.has(w.simplificationId)
  )
  setItem(STORAGE_KEYS.WATCH_OUTS, watchOuts)
}
