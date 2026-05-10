import { request } from './http';
import type { QuestionResponse, QuestionCreateRequest, QuestionQuery, ImportResponse } from '../types/question';

export const questionApi = {
  getQuestions: (query?: QuestionQuery) => {
    return request<QuestionResponse[]>({
      url: '/questions',
      method: 'GET',
      params: query
    });
  },
  createQuestion: (data: QuestionCreateRequest) => request<QuestionResponse>({
    url: '/questions',
    method: 'POST',
    data
  }),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return request<ImportResponse>({
      url: '/questions/import/excel',
      method: 'POST',
      data: formData
    });
  }
};
