export type Subject = 'CHINESE' | 'MATH';

export const QuestionType = {
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  FILL_BLANK: 'FILL_BLANK',
  MATCHING: 'MATCHING',
  DICTATION: 'DICTATION'
} as const;
export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export const QUESTION_TYPES = [
  { value: QuestionType.SINGLE_CHOICE, label: '选择题' },
  { value: QuestionType.TRUE_FALSE, label: '判断题' },
  { value: QuestionType.FILL_BLANK, label: '填空题' },
  { value: QuestionType.MATCHING, label: '匹配题' },
  { value: QuestionType.DICTATION, label: '听写题' }
];

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export const GenerationStrategy = {
  BANK_ONLY: 'BANK_ONLY',
  BANK_WITH_AI: 'BANK_WITH_AI',
  AI_ONLY: 'AI_ONLY'
} as const;
export type GenerationStrategy = typeof GenerationStrategy[keyof typeof GenerationStrategy];

export const GENERATION_STRATEGIES = [
  { value: GenerationStrategy.BANK_ONLY, label: '仅使用题库（数量不足会提示）' },
  { value: GenerationStrategy.BANK_WITH_AI, label: '题库优先，不足时AI补充' },
  { value: GenerationStrategy.AI_ONLY, label: '全部由AI生成' }
];

export type PaperVersion = 'student' | 'teacher';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};
