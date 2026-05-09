import { request } from './http';
import type { Curriculum, CurriculumCreate, CurriculumTreeNode } from '../types/curriculum';

export const curriculumApi = {
  getCurriculumList: (params?: { publisher?: string; subject?: string; grade?: string; volume?: string }) => 
    request<Curriculum[]>({
      url: '/curriculum',
      method: 'GET',
      params
    }),
    
  createCurriculum: (data: CurriculumCreate) => 
    request<Curriculum>({
      url: '/curriculum',
      method: 'POST',
      data
    }),
    
  updateCurriculum: (id: number, data: CurriculumCreate) => 
    request<Curriculum>({
      url: `/curriculum/${id}`,
      method: 'PUT',
      data
    }),
    
  deleteCurriculum: (id: number) => 
    request<null>({
      url: `/curriculum/${id}`,
      method: 'DELETE'
    }),
    
  getCurriculumTree: () => 
    request<CurriculumTreeNode[]>({
      url: '/curriculum/tree',
      method: 'GET'
    })
};
