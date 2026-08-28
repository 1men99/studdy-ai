export type QuestionGenerationResult = { questions: PracticeQuestion[] }
export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'short_answer';

export interface PracticeQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export type TextClassification = 'general' | 'textbook' | 'bill' | 'contract';

export interface WatchOutItem {
  category: string;
  title: string;
  description: string;
  severity?: 'warning' | 'alert' | 'info';
}

export interface SimplificationResult {
  session_id?: string;
  original_text: string;
  plain_language: string;
  watch_out_for: WatchOutItem[];
}

export type SimplifyResult = {
  plain_language: string;
  watch_out_for: WatchOutItem[];
}
