import axios from 'axios';
import JWTService from '@/jwt/JwtService';

const $URL = process.env.NEXT_PUBLIC_API_URL_CART;

class CartService {
  static async getCart() {
    try {
      JWTService.getToken();

      const response = await axios.get(`${$URL}/get`);

      if (response.data.token) {
        JWTService.setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async addToCart(productId: number) {
    try {
      JWTService.getToken();
      
      const response = await axios.post(`${$URL}/add`, null, {
        params: { productId }
      });

      if (response.data.token) {
        JWTService.setToken(response.data.token);
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already in cart')) {
        throw new Error('PRODUCT_ALREADY_IN_CART');
      }
      throw this.handleError(error);
    }
  }

  static async updateCartItem(productId: number, quantity: number) {
    try {
      JWTService.getToken();
      
      const response = await axios.put(`${$URL}/item/${productId}`, null, {
        params: { quantity }
      });

      if (response.data.token) {
        JWTService.setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async removeCartItem(productId: number) {
    try {
      JWTService.getToken();
      
      const response = await axios.delete(`${$URL}/item/${productId}`);

      if (response.data.token) {
        JWTService.setToken(response.data.token);
      }

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    if (error.response) {
      const message = error.response.data.message || 'Error en el servidor';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error('Error al procesar la solicitud');
    }
  }
}

export default CartService;