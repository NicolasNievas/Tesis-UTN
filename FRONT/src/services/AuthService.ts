import axios from 'axios';
import { AuthResponse, IUserData } from '@/interfaces/data.interfaces';

const $URL = process.env.NEXT_PUBLIC_API_URL_AUTH;

export const login = async (email: string, password: string): Promise<AuthResponse<string>> => {
  try {
    const response = await axios.post(`${$URL}/login`, { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return { response: token, status: 200, message: 'Login successful' };
  } catch (error: any) {
    return { message: error.response.data.message, status: error.response.status };
  }
};

export const register = async (userData: IUserData): Promise<AuthResponse<string>> => {
  try {
    const response = await axios.post(`${$URL}/register`, userData);
    const { token } = response.data;
    localStorage.setItem('token', token);
    return { response: token, status: 201, message: 'Registration successful' };
  } catch (error: any) {
    return { message: error.response.data.message, status: error.response.status };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};