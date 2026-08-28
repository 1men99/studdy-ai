import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { toast } from '@/hooks/useToast'
import type { SimplifyResult, TextClassification } from '@/types'
import { getApiBaseUrl } from '@/lib/api'

const HAS_CLERK_KEY = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

export function useSimplifyText() {
  const auth = HAS_CLERK_KEY ? useAuth() : null
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ text, text_type }: { text: string; text_type: TextClassification }) => {
      const token = auth ? await auth.getToken() : null
      let response: Response
      try {
        response = await fetch(`${getApiBaseUrl()}/api/v1/simplify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || 'dev_user_local'}`,
          },
          body: JSON.stringify({ text, text_type }),
        })
      } catch (err: any) {
        throw new Error(
          `Network connection failed when reaching backend API (${getApiBaseUrl()}). Please verify that your backend service is running and VITE_API_BASE_URL is correct.`
        )
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const errorMessage = error.message || error.detail || `Server error (${response.status}). Please try again.`
        throw new Error(errorMessage)
      }

      const data = await response.json().catch(() => null)
      if (!data) {
        throw new Error('Invalid response received from backend. Please verify your VITE_API_BASE_URL deployment setting.')
      }
      return data as SimplifyResult
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['simplification'], result)
      toast({
        title: 'Text Simplified!',
        description: 'Plain-language translation and watch-out items are ready.',
        variant: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Simplification Failed',
        description: error.message || 'Study could not process your request.',
        variant: 'error',
      })
    },
  })
}