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
      const response = await fetch(`${getApiBaseUrl()}/api/v1/simplify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'dev_user_local'}`,
        },
        body: JSON.stringify({ text, text_type }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const errorMessage = error.message || error.detail || 'Unable to simplify this text. Please try again.'
        throw new Error(errorMessage)
      }
      return (await response.json()) as SimplifyResult
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