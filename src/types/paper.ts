import type { Subject, QuestionType, Difficulty, GenerationStrategy } from './shared';

export interface PaperSectionConfig {
  title: string;
  questionType: QuestionType;
  questionCount: number;
  scorePerQuestion: number;
}

export interface PaperGenerateRequest {
  title: string;
  grade: string;
  publisher: string;
  subject: Subject;
  volume: string;
  unit: string;
  chapters: string[];
  totalScore: number;
  strategy: GenerationStrategy;
  difficulty?: Difficulty;
  sections: PaperSectionConfig[];
}

export interface PreviewSection {
  title: string;
  questionType: QuestionType;
  requiredCount: number;
  availableBankCount: number;
  aiSupplementCount: number;
  subtotalScore: number;
}

export interface PaperPlanPreview {
  totalScore: number;
  subtotalScore: number;
  sections: PreviewSection[];
}

export interface PaperQuestionResponse {
  id: number;
  sourceQuestionId: number | null;
  source: 'MANUAL' | 'EXCEL_IMPORT' | 'AI';
  stemSnapshot: string;
  contentSnapshotJson: string;
  answerSnapshotJson: string;
  analysisSnapshot?: string;
  score: number;
  sortOrder: number;
}

export interface PaperSectionResponse {
  id: number;
  title: string;
  questionType: QuestionType;
  questionCount: number;
  scorePerQuestion: number;
  subtotalScore: number;
  sortOrder: number;
  questions: PaperQuestionResponse[];
}

export interface PaperResponse {
  id: number;
  title: string;
  grade: string;
  publisher: string;
  subject: Subject;
  volume: string;
  unit: string;
  chapters: string[];
  totalScore: number;
  status: 'DRAFT' | 'SAVED';
  updatedAt: string;
  sections?: PaperSectionResponse[];
}

export type PaperSummaryResponse = Omit<PaperResponse, 'sections'>;

export interface QuestionSnapshotUpdate {
  stemSnapshot: string;
  contentSnapshotJson: string;
  answerSnapshotJson: string;
  analysisSnapshot?: string;
  score: number;
}
