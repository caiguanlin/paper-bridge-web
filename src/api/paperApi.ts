import { request } from './http';
import type { PaperGenerateRequest, PaperPlanPreview, PaperResponse, QuestionSnapshotUpdate } from '../types/paper';
import type { QuestionResponse } from '../types/question';

export const paperApi = {
  previewPlan: (data: PaperGenerateRequest) => request<PaperPlanPreview>({
    url: '/papers/preview-plan',
    method: 'POST',
    data
  }),
  
  generate: (data: PaperGenerateRequest) => request<PaperResponse>({
    url: '/papers/generate',
    method: 'POST',
    data
  }),
  
  getPapers: () => request<PaperResponse[]>({
    url: '/papers',
    method: 'GET'
  }),
  
  getPaperDetail: (paperId: number | string) => request<PaperResponse>({
    url: `/papers/${paperId}`,
    method: 'GET'
  }),
  
  updateQuestion: (paperId: number | string, paperQuestionId: number | string, data: QuestionSnapshotUpdate) => 
    request<PaperResponse>({
      url: `/papers/${paperId}/questions/${paperQuestionId}`,
      method: 'PATCH',
      data
    }),
    
  saveToBank: (paperId: number | string, paperQuestionId: number | string) => 
    request<QuestionResponse>({
      url: `/papers/${paperId}/questions/${paperQuestionId}/save-to-bank`,
      method: 'POST'
    }),
    
  printHtml: (paperId: number | string, version: 'student' | 'teacher' = 'student') => 
    request<string>({
      url: `/papers/${paperId}/print?version=${version}`,
      method: 'GET',
      responseType: 'text'
    }),
    
  exportWord: (paperId: number | string, version: 'student' | 'teacher' = 'student') => 
    request<Blob>({
      url: `/papers/${paperId}/export/word?version=${version}`,
      method: 'POST',
      responseType: 'blob'
    })
};
