import axios from "axios";
import JWTService from "../jwt/JwtService";

const $URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

export const adminAxios = axios.create({ baseURL: $URL });

adminAxios.interceptors.request.use((config) => {
    const token = JWTService.getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

adminAxios.interceptors.response.use((response) => (response),
    (error) => {
        if (error.response?.status === 401) {
            JWTService.removeToken();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }  
);