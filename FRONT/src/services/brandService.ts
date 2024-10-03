import { IBrandData, ICategoryData } from "@/interfaces/data.interfaces";
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

export const fetchCategoriesByBrand = async (brand: number): Promise<ICategoryData[]> => {
    try {
      const response = await axios.get<ICategoryData[]>(`${$URL}/${brand}/categoriesActive`);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories by brand:", error);
      throw error;
    }
  };