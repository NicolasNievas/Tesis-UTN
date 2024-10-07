import { IBrandData } from "@/interfaces/data.interfaces";
import { adminAxios } from "@/services/AdminAxiosInstance";

const $URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

export const getAllBrands = async () => {
    try {
        const response = await adminAxios.get<IBrandData[]>(`${$URL}/brands/allBrands`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all brands:", error);
        throw error;
    }
}

export const createBrand = async (brand: Partial<IBrandData>) => {
    try {
        const response = await adminAxios.post(`${$URL}/brands/create`, brand);
        return response.data;
    } catch (error) {
        console.error("Error creating brand:", error);
        throw error;
    }
  };

export const updateBrand = async (brandId: number, brand: IBrandData) => {
    try {
        const response = await adminAxios.put(`${$URL}/brands/update/${brandId}`, brand);
        return response.data;
    } catch (error) {
        console.error("Error updating brand:", error);
        throw error;
    }
};

export const deactivateBrand = async (brandId: number) => {
    try {
        const response = await adminAxios.put(`${$URL}/brands/${brandId}/deactivate`);
        return response.data;
    } catch (error) {
        console.error("Error deactivating brand:", error);
        throw error;
    }
};

export const reactivateBrand = async (brandId: number) => {
    try {
        const response = await adminAxios.put(`${$URL}/brands/${brandId}/reactivate`);
        return response.data;
    } catch (error) {
        console.error("Error reactivating brand:", error);
        throw error;
    }
};