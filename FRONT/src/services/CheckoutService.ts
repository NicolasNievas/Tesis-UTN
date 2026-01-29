import axios from 'axios';
import JWTService from '@/jwt/JwtService';
import { CheckoutData, UpdateShippingRequest } from '@/interfaces/data.interfaces';

const $URL = process.env.NEXT_PUBLIC_API_URL_CART;

class CheckoutService {
  static async getCheckoutInfo(): Promise<CheckoutData> {
    try {
      const token = JWTService.getToken();
      const response = await axios.get(`${$URL}/checkout`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting checkout info:', error);
      throw error;
    }
  }

  static async updateShippingInfo(data: UpdateShippingRequest): Promise<CheckoutData> {
    try {
      const token = JWTService.getToken();
      const response = await axios.put(`${$URL}/shipping`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating shipping info:', error);
      throw error;
    }
  }
}

export default CheckoutService;