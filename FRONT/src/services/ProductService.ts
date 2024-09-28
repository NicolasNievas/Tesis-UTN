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

export const fetchProductByBrand = async (brand: number): Promise<IProductData[]> => {
    try {
      const response = await axios.get<IProductData[]>(`${$URL}/allProductsByBrand/${brand}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product by brand:", error);
      throw error;
    }
  };

  export const fetchProductByCategory = async (category: number): Promise<IProductData[]> => {
    try {
      const response = await axios.get<IProductData[]>(`${$URL}/allProductsByCategory/${category}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product by category:", error);
      throw error;
    }
  };

export const postProduct = async (productData: Partial<IProductData>) => {
  try {
    const response = await axios.post(`${$URL}/create`, productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};