import { useEffect, useState } from "react";
import axios from "axios";
import JWTService from "@/jwt/JwtService";

export interface RequestError{
    name: string;
    message: string;
    stack?: string;
}

const $URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

export const useApi = <T,>(path?: string) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<RequestError | undefined>();

    const fetchData = async (path : string) => {
        setIsLoading(true);

        try{
            if (!JWTService.isAdmin()) {
                throw new Error("Unauthorized: Admin access required");
            }

            const token = JWTService.getToken();
            
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const { data } = await axios.get<T>(`${$URL}${path}`, { headers });
            setData(data)
        } catch (err){
            if(err instanceof Error){
                const error = {
                    name: err.name,
                    message: err.message,
                    stack: err.stack
                }
                setError(error)
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if(path){
            fetchData(path);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path]);

    return { data, loading, error };
}; 

export default useApi;