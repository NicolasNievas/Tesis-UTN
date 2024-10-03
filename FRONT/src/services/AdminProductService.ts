import { IProductData } from "@/interfaces/data.interfaces";
import axios from "axios";

const $URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

export const postProduct = async (productData: Partial<IProductData>) => {
    try {
      const response = await axios.post(`${$URL}/products/create`, productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  };
  
  export const desactivateProduct = async (productId: number) => {
    try{
      const response = await axios.put(`${$URL}/products/desactive/${productId}`);
      return response.data;
    }catch(error){
      throw error;
    }
  };
  
  export const reactivateProduct = async (productId: number) => {
    try{
      const response = await axios.put(`${$URL}/products/reactive/${productId}`);
      return response.data;
    } catch(error){
      throw error;
    }
  };
  
  export const updateProduct = async (product: Partial<IProductData>) => {
    try{
      const response = await axios.put(`${$URL}/products/update/${product.id}`, product);
      return response.data;
    } catch(error){
      throw new Error("Error updating product");
    }
  }