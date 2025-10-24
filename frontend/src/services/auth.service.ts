import apiClient from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      user_id: string;
      username: string;
      name: string;
      email: string;
      role: string;
      unit_id: string;
    };
    tokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
  message: string;
}

export interface User {
  user_id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  unit_id: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return {
      token: response.data.data.tokens.access_token,
      user: response.data.data.user
    };
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    return response.data;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user_info');
    return userStr ? JSON.parse(userStr) : null;
  }

  storeAuth(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_info', JSON.stringify(user));
  }

  clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  }
}

export default new AuthService();
