import axios from "axios";
import { ConversionRate, CustomerStatistics, InventoryReport, MonthlyTrends, OrdersByStatus, OrderStatistics, PaymentMethodReport, ProductsWithoutMovement, SalesByBrand, SalesByCategory, SalesByPeriodReport, ShippingMethodReport, TopCustomer, TopProductByPeriod, TopProductReport } from "@/interfaces/data.interfaces";

const $URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

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

  // New methods for additional reports
  static async getSalesByPeriodReport(
    period: string = 'day',
    startDate?: string,
    endDate?: string
  ): Promise<SalesByPeriodReport[]> {
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (endDate) params.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      const response = await axios.get(`${$URL}/reports/salesByPeriod?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getCustomerStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<CustomerStatistics[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (endDate) params.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      const response = await axios.get(`${$URL}/reports/customer-statistics?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
    try {
      const response = await axios.get(`${$URL}/reports/top-customers?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getInventoryReport(
    startDate?: string,
    endDate?: string
  ): Promise<InventoryReport[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (endDate) params.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      const response = await axios.get(`${$URL}/reports/inventory?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

   static async getOrderStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<OrderStatistics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (endDate) params.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      const response = await axios.get(`${$URL}/reports/order-statistics?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getOrdersByStatus(
    startDate?: string,
    endDate?: string
  ): Promise<OrdersByStatus[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (endDate) params.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      const response = await axios.get(`${$URL}/reports/orders-by-status?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getConversionRate(
    startDate?: string,
    endDate?: string
  ): Promise<ConversionRate> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (endDate) params.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      const response = await axios.get(`${$URL}/reports/conversion-rate?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getSalesByBrand(
    startDate?: string,
    endDate?: string
  ): Promise<SalesByBrand[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (endDate) params.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      const response = await axios.get(`${$URL}/reports/sales-by-brand?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getSalesByCategory(
    startDate?: string,
    endDate?: string
  ): Promise<SalesByCategory[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (endDate) params.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      const response = await axios.get(`${$URL}/reports/sales-by-category?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getProductsWithoutMovement(
    startDate?: string,
    minStock?: number,
    maxStock?: number,
    includeZeroStock?: boolean
  ): Promise<ProductsWithoutMovement[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (minStock !== undefined) params.append('minStock', minStock.toString());
      if (maxStock !== undefined) params.append('maxStock', maxStock.toString());
      if (includeZeroStock !== undefined) params.append('includeZeroStock', includeZeroStock.toString());
      
      const response = await axios.get(`${$URL}/reports/products-without-movement?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getShippingMethodReport(
    startDate?: string,
    endDate?: string
  ): Promise<ShippingMethodReport[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate + 'T00:00:00').toISOString());
      if (endDate) params.append('endDate', new Date(endDate + 'T23:59:59').toISOString());
      const response = await axios.get(`${$URL}/reports/shipping-methods?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getMonthlyTrendsReport(
  startDate?: string, 
  endDate?: string
): Promise<MonthlyTrends[]> {
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
    
    const response = await axios.get(`${$URL}/reports/monthly-trends?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

static async getTopProductByPeriodReport(
  period: string = 'day',
  startDate?: string,
  endDate?: string
): Promise<TopProductByPeriod> {
  try {
    const params = new URLSearchParams();
    params.append('period', period);
    
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
    
    const response = await axios.get(`${$URL}/reports/top-product-period?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
}

export default ReportService;