'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '@/services/AuthService';
import JWTService from '@/jwt/JwtService';
import { LoginRequest, PasswordResetResponse, RegisterRequest, ResetPasswordRequest } from '@/interfaces/data.interfaces';

interface IAuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<PasswordResetResponse>;
  resetPassword: (request: ResetPasswordRequest) => Promise<PasswordResetResponse>;
  logout: () => void;
  loading: boolean;
  userEmail: string | null;
}

interface IDataProvideProps {
  children: JSX.Element[] | JSX.Element | React.ReactNode;
}

const AuthContext = createContext<IAuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: IDataProvideProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    AuthService.setupAxiosInterceptors();
  }, []);

  const checkAuth = () => {
    const isValid = JWTService.isTokenValid();
    setIsAuthenticated(isValid);
    setIsAdmin(isValid && JWTService.isAdmin());
    setUserEmail(JWTService.getUserEmail());
    setLoading(false);
  };

  const login = async (request: LoginRequest) => {
    try {
      await AuthService.login(request);
      checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const register = async (request: RegisterRequest) => {
    try {
      await AuthService.register(request);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserEmail(null);
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      await AuthService.verifyEmail(email, code);
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      return await AuthService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (request: ResetPasswordRequest) => {
    try {
      return await AuthService.resetPassword(request);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isAdmin, 
        login, 
        register, 
        verifyEmail,
        forgotPassword,
        resetPassword,
        logout, 
        loading,
        userEmail 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}