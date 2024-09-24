import { IBrandData } from "@/interfaces/data.interfaces";
import axios from "axios";

const $URL = process.env.NEXT_PUBLIC_API_URL_BRANDS;

export const getAllActiveBrands = async () => {
    try {
        const response = await axios.get<IBrandData[]>(`${$URL}/active`);
        return response.data;
    } catch (error) {
        console.error("Error fetching active brands:", error);
        throw error;
    }
}