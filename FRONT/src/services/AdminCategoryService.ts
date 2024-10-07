import { ICategoryData } from "@/interfaces/data.interfaces";
import { adminAxios } from "@/services/AdminAxiosInstance";

const $URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

export const fetchAllCategoriesByBrand = async (brand: number): Promise<ICategoryData[]> => {
    try {
      const response = await adminAxios.get<ICategoryData[]>(`${$URL}/category/${brand}/allCategories`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all categories by brand:", error);
      throw error;
    }
  }

export const createCategory = async (brandId: number, category: Partial<ICategoryData>) => {
    try {
        const response = await adminAxios.post(`${$URL}/category/${brandId}/create`, category);
        return response.data;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

export const desactiveCategory = async (brandId: number, categoryId: number) => {
    try {
        const response = await adminAxios.put(`${$URL}/category/${brandId}/${categoryId}/desactive`);
        return response.data;
    } catch (error) {
        console.error("Error desactivating category:", error);
        throw error;
    }
};  


export const reactiveCategory = async (brandId: number, categoryId: number) => {
    try {
        const response = await adminAxios.put(`${$URL}/category/${brandId}/${categoryId}/reactive`);
        return response.data;
    } catch (error) {
        console.error("Error reactivating category:", error);
        throw error;
    }
};

export const updateCategory = async (brandId: number, categoryId: number, categoryName: string) => {
    try {
        const response = await adminAxios.put(`${$URL}/category/${brandId}/${categoryId}/update`, { name: categoryName });
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};