import type { QuestionType } from './shared';

export interface QuestionTypeTemplateItem {
  id?: number;
  title: string;
  questionType: QuestionType;
  questionCount: number;
  scorePerQuestion: number;
  sortOrder?: number;
}

export interface QuestionTypeTemplate {
  id: number;
  name: string;
  totalScore: number;
  sortOrder: number;
  updatedAt: string;
  items: QuestionTypeTemplateItem[];
}

export interface QuestionTypeTemplateCreate {
  name: string;
  items: QuestionTypeTemplateItem[];
}
