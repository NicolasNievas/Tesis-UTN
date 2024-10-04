import axios from 'axios';
import { IUserData } from '@/interfaces/data.interfaces';
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