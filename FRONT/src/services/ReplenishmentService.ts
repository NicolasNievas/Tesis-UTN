// services/stockMovementService.ts
import axios from 'axios';
import JWTService from '@/jwt/JwtService';
import { IProductData } from '@/interfaces/data.interfaces';

export interface StockMovementFilters {
  startDate?: string;
  endDate?: string;
  movementType?: string;
  productId?: string;
}

export interface StockMovement {
  id: number;
  date: string | number[];
  quantity: number;
  product: IProductData;
  movementType: 'INCOME' | 'EXPENSE';
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL_REPLENISMENT;

export class StockMovementService {
  static formatDateForAPI(dateString: string): string {
    // Si no hay fecha, retornamos undefined para que no se incluya en los parámetros
    if (!dateString) return '';
    
    // Asumiendo que dateString viene en formato YYYY-MM-DD
    // Agregamos la hora según si es fecha inicio (00:00:00) o fecha fin (23:59:59)
    const isEndDate = dateString.includes('endDate');
    const date = new Date(dateString);
    
    if (isEndDate) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    
    return date.toISOString();
  }

  static formatDateForDisplay(date: string | number[]): string {
    if (Array.isArray(date)) {
      // Si la fecha viene como array [year, month, day, hour, minute, second, nano]
      const [year, month, day, hour, minute] = date;
      return new Date(year, month - 1, day, hour, minute)
        .toLocaleString('es-AR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
    
    // Si la fecha viene como string ISO
    return new Date(date).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static async getMovements(filters: StockMovementFilters): Promise<StockMovement[]> {
    try {
      const token = JWTService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams();
      
      if (filters.startDate) {
        params.append('startDate', this.formatDateForAPI(filters.startDate));
      }
      if (filters.endDate) {
        params.append('endDate', this.formatDateForAPI(filters.endDate));
      }
      if (filters.movementType) {
        params.append('movementType', filters.movementType);
      }
      if (filters.productId) {
        params.append('productId', filters.productId);
      }

      const response = await axios.get(`${BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error fetching stock movements');
      }
      throw error;
    }
  }
}