import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@clerk/clerk-react'
import type { SimplifyResult, TextClassification } from '@/types'
import { saveLocalSimplificationSession } from '@/services/localStorageSessions'

const HAS_CLERK_KEY = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
const HAS_CONVEX_URL = Boolean(import.meta.env.VITE_CONVEX_URL)

export function useSimplificationPersistence() {
  const authUser = HAS_CLERK_KEY ? useUser() : null
  const user = authUser?.user

  const syncProfile = HAS_CONVEX_URL && user ? useMutation(api.users.syncProfile) : null
  const createSession = HAS_CONVEX_URL && user ? useMutation(api.sessions.create) : null
  const createSimplification = HAS_CONVEX_URL && user ? useMutation(api.simplifications.create) : null
  const addWatchOut = HAS_CONVEX_URL && user ? useMutation(api.simplifications.addWatchOut) : null

  async function persist(text: string, textType: TextClassification, result: SimplifyResult) {
    // 1. Unconditionally save locally
    const localSessionId = saveLocalSimplificationSession(text, result)

    // 2. Sync to Convex DB if user is authenticated
    if (user && syncProfile && createSession && createSimplification && addWatchOut) {
      try {
        await syncProfile({
          email: user.primaryEmailAddress?.emailAddress || '',
          fullName: user.fullName || user.username || 'Student',
          imageUrl: user.imageUrl || '',
        })
        const sessionId = await createSession({
          type: 'simplification',
          title: 'Plain-language explanation',
          sourceText: text,
          status: 'completed',
        })
        const simplificationId = await createSimplification({
          sessionId,
          originalText: text,
          plainLanguage: result.plain_language,
        })
        for (const item of result.watch_out_for) {
          await addWatchOut({
            simplificationId,
            category: item.category,
            title: item.title,
            description: item.description,
            severity: item.severity || 'info',
          })
        }
        return sessionId
      } catch {
        // Fallback silently to local session
      }
    }

    void textType
    return localSessionId
  }

  return { persist }
}