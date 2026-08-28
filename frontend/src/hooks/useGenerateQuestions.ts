import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { toast } from '@/hooks/useToast'
import type { QuestionGenerationResult } from '@/types'

type GenerateQuestionsInput = {
  notes: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const HAS_CLERK_KEY = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

export function useGenerateQuestions() {
  const auth = HAS_CLERK_KEY ? useAuth() : null
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ notes, difficulty = 'medium' }: GenerateQuestionsInput) => {
      const token = auth ? await auth.getToken() : null
      const response = await fetch(`${API_BASE_URL}/api/v1/questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'dev_user_local'}`,
        },
        body: JSON.stringify({ notes, difficulty, question_count: 10 }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const errorMessage = error.message || error.detail || 'Unable to generate practice questions. Please try again.'
        throw new Error(errorMessage)
      }
      return (await response.json()) as QuestionGenerationResult
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['generated-questions'], result)
      toast({
        title: 'Quiz Ready!',
        description: 'Successfully created 10 practice questions from your notes.',
        variant: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Study could not process your request.',
        variant: 'error',
      })
    },
  })
}