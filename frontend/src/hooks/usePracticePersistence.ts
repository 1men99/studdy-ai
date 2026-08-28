import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@clerk/clerk-react'
import type { PracticeQuestion } from '@/types'
import {
  saveLocalPracticeSession,
  recordLocalAnswer,
} from '@/services/localStorageSessions'

const HAS_CLERK_KEY = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
const HAS_CONVEX_URL = Boolean(import.meta.env.VITE_CONVEX_URL)

export function usePracticePersistence() {
  const authUser = HAS_CLERK_KEY ? useUser() : null
  const user = authUser?.user

  // Convex mutations - called safely if Convex URL is configured
  const syncProfile = HAS_CONVEX_URL ? useMutation(api.users.syncProfile) : null
  const createSession = HAS_CONVEX_URL ? useMutation(api.sessions.create) : null
  const addQuestion = HAS_CONVEX_URL ? useMutation(api.questions.add) : null
  const recordAnswer = HAS_CONVEX_URL ? useMutation(api.questions.recordAnswer) : null

  async function persistQuestions(notes: string, questions: PracticeQuestion[]) {
    // 1. Always save to local storage (guarantees zero data loss in guest/offline mode)
    const localResult = saveLocalPracticeSession(notes, questions)

    // 2. Sync to Convex DB if user is authenticated and Convex is online
    if (user && syncProfile && createSession && addQuestion) {
      try {
        await syncProfile({
          email: user.primaryEmailAddress?.emailAddress || '',
          fullName: user.fullName || user.username || 'Student',
          imageUrl: user.imageUrl || '',
        })
        const sessionId = await createSession({
          type: 'practice_questions',
          title: 'Practice questions',
          sourceText: notes,
          status: 'completed',
        })
        const questionIds = new Map<string, string>()
        for (const [index, question] of questions.entries()) {
          const questionId = await addQuestion({
            sessionId,
            questionNumber: index + 1,
            type: question.type,
            question: question.question,
            options: question.options || [],
            correctAnswer: question.answer,
            explanation: question.explanation || '',
          })
          questionIds.set(question.id || String(index), questionId)
        }
        return { sessionId, questionIds }
      } catch {
        // Fallback silently to local storage result if Convex network/auth fails
      }
    }

    return localResult
  }

  async function saveAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
    isCorrect: boolean
  ) {
    // Save to local storage
    recordLocalAnswer(sessionId, questionId, answer, isCorrect)

    // Sync to Convex DB if connected
    if (user && recordAnswer && !sessionId.startsWith('local_')) {
      try {
        await recordAnswer({
          sessionId: sessionId as never,
          questionId: questionId as never,
          userAnswer: answer,
          isCorrect,
        })
      } catch {
        // Ignore remote sync errors
      }
    }
  }

  return { persistQuestions, saveAnswer }
}