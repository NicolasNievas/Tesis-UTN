import { IProductData } from "@/interfaces/data.interfaces";
import axios from "axios";

const $URL = process.env.NEXT_PUBLIC_API_URL_PRODUCTS;

//obtener todos los productos activos
export const fetchActiveProducts = async () => {
    try {
        const response = await axios.get<IProductData[]>(`${$URL}/allProductsActive`);
        return response.data;
    } catch (error) {
        console.error("Error fetching active products:", error);
        throw error;
    }
};