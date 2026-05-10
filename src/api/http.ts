import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 定义接口返回类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string | null;
}

const http = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

const readBlobErrorMessage = async (data: unknown) => {
  if (!(data instanceof Blob)) {
    return null;
  }

  try {
    const text = await data.text();
    if (!text) {
      return null;
    }
    const parsed = JSON.parse(text);
    return typeof parsed?.message === 'string' ? parsed.message : null;
  } catch {
    return null;
  }
};

const hasMessage = (data: unknown): data is { message: string } => {
  return typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string';
};

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('teacher_token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 处理 blob 或 arraybuffer（如文件下载）
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response.data;
    }

    const res = response.data;

    // 如果是统一 JSON 响应格式
    if (typeof res === 'object' && res !== null && 'success' in res) {
      if (!res.success) {
        return Promise.reject(new Error(res.message || '请求失败'));
      }
      return res.data;
    }

    // 兼容其他返回格式（比如 HTML 打印）
    return res;
  },
  async (error: unknown) => {
    const axiosError = axios.isAxiosError(error) ? error : null;
    let message = '请求失败';
    const blobMessage = await readBlobErrorMessage(axiosError?.response?.data);
    if (blobMessage) {
      message = blobMessage;
    } else if (hasMessage(axiosError?.response?.data)) {
      message = axiosError.response.data.message;
    } else if (error instanceof Error && error.message) {
      message = error.message;
    }

    // 处理 401 和 403 认证或授权失败的问题
    if (axiosError?.response && (axiosError.response.status === 401 || axiosError.response.status === 403)) {
      message = '认证失败或登录已过期，请重新登录';
      // 清除本地过期的 token 
      localStorage.removeItem('teacher_token');
      // 跳转到登录页 (避免当前已经在登录页时无限重定向)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export const request = <T>(config: AxiosRequestConfig): Promise<T> => {
  return http.request<ApiResponse<T>, T>(config);
};

export default http;
