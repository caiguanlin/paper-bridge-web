export interface Curriculum {
  id: number;
  publisher: string;
  subject: string;
  grade: string;
  volume: string;
  unit: string;
  chapter: string;
  sortOrder: number;
  editionYear: number | null;
  sourceUrl: string | null;
}

export interface CurriculumCreate {
  publisher: string;
  subject: string;
  grade: string;
  volume: string;
  unit: string;
  chapter: string;
  sortOrder?: number;
  editionYear?: number;
  sourceUrl?: string | null;
}

export interface CurriculumTreeNode {
  label: string;
  value: string;
  type: 'publisher' | 'subject' | 'grade' | 'volume' | 'unit' | 'chapter';
  id: number | null;
  children: CurriculumTreeNode[];
}
