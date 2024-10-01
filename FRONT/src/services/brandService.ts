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

export const getAllBrands = async () => {
    try {
        const response = await axios.get<IBrandData[]>(`${$URL}/allBrands`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all brands:", error);
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

  export const fetchAllCategoriesByBrand = async (brand: number): Promise<ICategoryData[]> => {
    try {
      const response = await axios.get<ICategoryData[]>(`${$URL}/${brand}/allCategories`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all categories by brand:", error);
      throw error;
    }
  }

export const createBrand = async (brand: Partial<IBrandData>) => {
    try {
        const response = await axios.post(`${$URL}/create`, brand);
        return response.data;
    } catch (error) {
        console.error("Error creating brand:", error);
        throw error;
    }
  };

export const updateBrand = async (brandId: number, brand: IBrandData) => {
    try {
        const response = await axios.put(`${$URL}/update/${brandId}`, brand);
        return response.data;
    } catch (error) {
        console.error("Error updating brand:", error);
        throw error;
    }
};

export const deactivateBrand = async (brandId: number) => {
    try {
        const response = await axios.put(`${$URL}/${brandId}/deactivate`);
        return response.data;
    } catch (error) {
        console.error("Error deactivating brand:", error);
        throw error;
    }
};

export const reactivateBrand = async (brandId: number) => {
    try {
        const response = await axios.put(`${$URL}/${brandId}/reactivate`);
        return response.data;
    } catch (error) {
        console.error("Error reactivating brand:", error);
        throw error;
    }
};

export const createCategory = async (brandId: number, category: Partial<ICategoryData>) => {
    try {
        const response = await axios.post(`${$URL}/${brandId}/category`, category);
        return response.data;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

export const desactiveCategory = async (brandId: number, categoryId: number) => {
    try {
        const response = await axios.put(`${$URL}/${brandId}/category/${categoryId}/desactive`);
        return response.data;
    } catch (error) {
        console.error("Error desactivating category:", error);
        throw error;
    }
};  


export const reactiveCategory = async (brandId: number, categoryId: number) => {
    try {
        const response = await axios.put(`${$URL}/${brandId}/category/${categoryId}/reactive`);
        return response.data;
    } catch (error) {
        console.error("Error reactivating category:", error);
        throw error;
    }
};

export const updateCategory = async (brandId: number, categoryId: number, categoryName: string) => {
    try {
        const response = await axios.put(`${$URL}/${brandId}/categories/${categoryId}`, { name: categoryName });
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};