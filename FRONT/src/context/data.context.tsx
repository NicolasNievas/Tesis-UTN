'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '@/services/AuthService';
import JWTService from '@/jwt/JwtService';
import { LoginRequest, RegisterRequest } from '@/interfaces/data.interfaces';

interface IAuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
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
      checkAuth();
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

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isAdmin, 
        login, 
        register, 
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