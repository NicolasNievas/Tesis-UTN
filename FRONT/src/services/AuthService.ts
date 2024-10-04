import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/interfaces/data.interfaces';
import JWTService from '@/jwt/JwtService';

const API_URL = process.env.NEXT_PUBLIC_API_URL_AUTH;

class AuthService {
  static async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/login`,
        request
      );
      
      if (response.data.token) {
        JWTService.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error during login');
      }
      throw error;
    }
  }

  static async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/register`,
        request
      );
      
      if (response.data.token) {
        JWTService.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error during registration');
      }
      throw error;
    }
  }

  static logout(): void {
    JWTService.removeToken();
  }

  static setupAxiosInterceptors(): void {
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

export default AuthService;