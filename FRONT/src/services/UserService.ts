import axios from 'axios';
import { IUserData, UpdateUserRequest } from '@/interfaces/data.interfaces';
import JWTService from '@/jwt/JwtService';

const API_URL = process.env.NEXT_PUBLIC_API_URL_USERS;

export const getUserProfile = async (): Promise<IUserData> => {
    try {
        const token = JWTService.getToken();
        const response = await axios.get<IUserData>(`${API_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (data: UpdateUserRequest): Promise<IUserData> => {
    try {
        const token = JWTService.getToken();
        const response = await axios.put<IUserData>(`${API_URL}/update/profile`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};