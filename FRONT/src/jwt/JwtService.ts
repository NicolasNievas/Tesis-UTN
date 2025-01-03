import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/interfaces/data.interfaces';
import axios from 'axios';

class JWTService {
  private static readonly TOKEN_KEY = 'token';
  private static readonly TOKEN_PREFIX = 'Bearer ';

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      this.setAuthHeader(token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        this.setAuthHeader(token);
      }
      return token;
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      this.removeAuthHeader();
    }
  }

  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      // Add a 5-minute buffer to prevent edge cases
      if (decoded.exp <= currentTime + 300) {
        this.removeToken();
        return false;
      }
      return true;
    } catch {
      this.removeToken();
      return false;
    }
  }

  static decodeToken(token: string): DecodedToken {
    return jwtDecode<DecodedToken>(token);
  }

  static getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = this.decodeToken(token);
      return decoded.sub;
    } catch {
      return null;
    }
  }

  static isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = this.decodeToken(token);
      return decoded.authorities.includes('ROLE_ADMINISTRATOR');
    } catch {
      return false;
    }
  }

  private static setAuthHeader(token: string): void {
    if (axios.defaults.headers) {
      axios.defaults.headers.common['Authorization'] = `${this.TOKEN_PREFIX}${token}`;
    }
  }

  private static removeAuthHeader(): void {
    if (axios.defaults.headers) {
      delete axios.defaults.headers.common['Authorization'];
    }
  }
}

export default JWTService;