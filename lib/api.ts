import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getFreshIdToken } from '@/lib/auth/firebaseClient';

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      async (config) => {
        // For client-side requests, get fresh token
        if (typeof window !== 'undefined') {
          const token = await getFreshIdToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['x-jwt-token'] = token;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle 401 errors and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Try to get a fresh token
            const newToken = await getFreshIdToken(true);
            
            if (newToken) {
              // Update headers with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                originalRequest.headers['x-jwt-token'] = newToken;
              }

              // Process queued requests
              this.processQueue(null, newToken);

              // Retry the original request
              return this.client(originalRequest);
            } else {
              // No fresh token available, logout user
              this.processQueue(new Error('Token refresh failed'), null);
              await this.logout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.processQueue(refreshError as Error, null);
            await this.logout();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: Error | null, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async logout() {
    try {
      // Clear session on backend
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      
      // Redirect to login with expired reason
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=expired';
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Server-side request method (for API routes)
  async serverRequest<T = any>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: any,
    token?: string
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      headers: {},
    };

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        'x-jwt-token': token,
      };
    }

    const response = await this.client.request<T>(config);
    return response.data;
  }
}

// Create and export the API client instance
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://ezlift-server-production.fly.dev';

export const apiClient = new ApiClient({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
});

// Export the class for testing or custom instances
export { ApiClient };

// Convenience exports
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  serverRequest: apiClient.serverRequest.bind(apiClient),
}; 