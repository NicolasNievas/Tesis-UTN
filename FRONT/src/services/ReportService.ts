import axios from "axios";

const $URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

interface PaymentMethodReport {
  paymentMethod: string;
  orderCount: number;
  totalSales: number;
}

interface TopProductReport {
  productName: string;
  totalQuantity: number;
  totalSales: number;
}

class ReportService {
  static async getPaymentMethodReport(
    startDate?: string,
    endDate?: string
  ): Promise<PaymentMethodReport[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        params.append('startDate', startDateTime.toISOString());
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        params.append('endDate', endDateTime.toISOString());
      }
      const response = await axios.get(`${$URL}/reports/payment-methods?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getTopProductsReport(
    startDate?: string,
    endDate?: string
  ): Promise<TopProductReport[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        params.append('startDate', startDateTime.toISOString());
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        params.append('endDate', endDateTime.toISOString());
      }
      const response = await axios.get(`${$URL}/reports/top-selling-products?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ReportService;