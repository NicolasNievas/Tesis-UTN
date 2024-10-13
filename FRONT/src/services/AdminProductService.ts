import { IProductData } from "@/interfaces/data.interfaces";
import { adminAxios } from "@/services/AdminAxiosInstance";

const $URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

export const postProduct = async (productData: Partial<IProductData>) => {
    try {
      const response = await adminAxios.post(`${$URL}/products/create`, productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  };
  
  export const desactivateProduct = async (productId: number) => {
    try{
      const response = await adminAxios.put(`${$URL}/products/desactive/${productId}`);
      return response.data;
    }catch(error){
      throw error;
    }
  };
  
  export const reactivateProduct = async (productId: number) => {
    try{
      const response = await adminAxios.put(`${$URL}/products/reactive/${productId}`);
      return response.data;
    } catch(error){
      throw error;
    }
  };
  
  export const updateProduct = async (product: Partial<IProductData>) => {
    try{
      const response = await adminAxios.put(`${$URL}/products/update/${product.id}`, product);
      return response.data;
    } catch(error){
      throw new Error("Error updating product");
    }
  }

export const getAllProductsWithNoStock = async (): Promise<IProductData[]> => {
  try{
    const response = await adminAxios.get(`${$URL}/products/allProductsWithNoStock`);
    return response.data;
  } catch(error){
    throw error;
  }
};