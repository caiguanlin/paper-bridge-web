import { request } from './http';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const authApi = {
  login: (data: LoginRequest) => request<AuthResponse>({
    url: '/auth/login',
    method: 'POST',
    data
  }),
  register: (data: RegisterRequest) => request<AuthResponse>({
    url: '/auth/register',
    method: 'POST',
    data
  })
};
