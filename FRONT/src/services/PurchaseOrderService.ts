import axios from 'axios';
import JWTService from '@/jwt/JwtService';
import { DeliveryConfirmationDetail, InvoiceResponse, ProviderOrderDetail, PurchaseOrderResponse } from '@/interfaces/data.interfaces';

const $URL = process.env.NEXT_PUBLIC_API_URL_PURCHASE;

export class PurchaseOrderService {
  static async createOrder(providerId: number, details: ProviderOrderDetail[]): Promise<PurchaseOrderResponse> {
    try {
      const token = JWTService.getToken();
      console.log('Sending request to create order with details:', details); // Debugging line
      const response = await axios.post(
        `${$URL}/${providerId}`,
        details,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error : any) {
      console.error('Error creating order:', error.response?.data || error.message); // Debugging line
      throw this.handleError(error);
    }
  }

  static async simulateDelivery(orderId: number) {
    try {
      const token = JWTService.getToken();
      const response = await axios.get(
        `${$URL}/${orderId}/simulate`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error simulating delivery:', error.response?.data || error.message); // Debugging line
      throw this.handleError(error);
    }
  }

  static async confirmDelivery(orderId: number, details: DeliveryConfirmationDetail[]): Promise<InvoiceResponse> {
    try {
      const token = JWTService.getToken();
      const response = await axios.post(
        `${$URL}/${orderId}/confirm`,
        details,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error confirming delivery:', error.response?.data || error.message); // Debugging line
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data.message || 'An error occurred';
      return new Error(message);
    }
    return new Error('Network error occurred');
  }
}

export default PurchaseOrderService;