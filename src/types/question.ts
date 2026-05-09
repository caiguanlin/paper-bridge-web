import type { Subject, QuestionType, Difficulty } from './shared';

export interface QuestionResponse {
  id: number;
  grade: string;
  publisher: string;
  subject: Subject;
  volume: string;
  unit: string;
  chapter: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  stem: string;
  contentJson: string;
  answerJson: string;
  analysis?: string;
  source: 'MANUAL' | 'EXCEL_IMPORT' | 'AI';
  usageCount: number;
  updatedAt: string;
}

export interface QuestionCreateRequest {
  grade: string;
  publisher: string;
  subject: Subject;
  volume: string;
  unit: string;
  chapter: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  stem: string;
  contentJson: string;
  answerJson: string;
  analysis?: string;
}

export interface QuestionQuery {
  grade?: string;
  publisher?: string;
  subject?: Subject;
  volume?: string;
  unit?: string;
  chapter?: string;
  questionType?: QuestionType;
  difficulty?: Difficulty;
}

export interface ImportResponse {
  successCount: number;
  failureCount: number;
  errors: Array<{
    rowNumber: number;
    fieldName: string;
    message: string;
  }>;
}
