import axios from 'axios';
import JWTService from '@/jwt/JwtService';
import { DeliveryConfirmationDetail, InvoiceResponse, ProviderOrderDetail, PurchaseOrderResponse } from '@/interfaces/data.interfaces';

const $URL = process.env.NEXT_PUBLIC_API_URL_PURCHASE;

class PurchaseOrderService {
  static async createOrder(providerId: number, details: ProviderOrderDetail[]): Promise<PurchaseOrderResponse> {
    try {
      const response = await axios.post(
        `${$URL}/${providerId}`,
        details
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async simulateDelivery(orderId: number) {
    try {
      const response = await axios.get(
        `${$URL}/${orderId}/simulate`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async confirmDelivery(orderId: number, details: DeliveryConfirmationDetail[]): Promise<InvoiceResponse> {
    try {
      const response = await axios.post(
        `${$URL}/${orderId}/confirm`,
        details
      );
      return response.data;
    } catch (error) {
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