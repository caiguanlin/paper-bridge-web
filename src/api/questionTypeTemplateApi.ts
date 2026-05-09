import { request } from './http';
import type { QuestionTypeTemplate, QuestionTypeTemplateCreate } from '../types/questionTypeTemplate';

export const questionTypeTemplateApi = {
  list: () => request<QuestionTypeTemplate[]>({
    url: '/question-type-templates',
    method: 'GET'
  }),

  detail: (id: number) => request<QuestionTypeTemplate>({
    url: `/question-type-templates/${id}`,
    method: 'GET'
  }),

  create: (data: QuestionTypeTemplateCreate) => request<QuestionTypeTemplate>({
    url: '/question-type-templates',
    method: 'POST',
    data
  }),

  update: (id: number, data: QuestionTypeTemplateCreate) => request<QuestionTypeTemplate>({
    url: `/question-type-templates/${id}`,
    method: 'PUT',
    data
  }),

  delete: (id: number) => request<null>({
    url: `/question-type-templates/${id}`,
    method: 'DELETE'
  })
};
