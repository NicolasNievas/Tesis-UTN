import axios from 'axios';
import { OrderResponse, PaginatedResponse } from '@/interfaces/data.interfaces';

const $URLADMIN = process.env.NEXT_PUBLIC_API_URL_ADMIN;
const $URL = process.env.NEXT_PUBLIC_API_URL_ORDERS;

// Nueva interfaz para los KPIs
export interface OrderKPIs {
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
}

class OrderService {
    static async getAllOrders(
        page: number = 0,
        size: number = 5,
        status?: string,
        startDate?: string,
        endDate?: string,
        searchQuery?: string
    ): Promise<PaginatedResponse<OrderResponse>> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });
            if (status && status !== 'ALL') {
                params.append('status', status);
            }
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
            if (searchQuery && searchQuery.trim()) {
                params.append('searchQuery', searchQuery.trim());
            }
            const response = await axios.get(`${$URLADMIN}/orders?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async getOrderKPIsFromReports(): Promise<OrderKPIs> {
        try {
            const $URLREPORTS = process.env.NEXT_PUBLIC_API_URL_REPORTS;
            
            // Fecha desde hace 10 años para obtener todos los datos
            const today = new Date();
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(today.getFullYear() - 10);
            
            const startDate = tenYearsAgo.toISOString().split('T')[0];
            const endDate = today.toISOString().split('T')[0];

            const response = await axios.get(
                `${$URLREPORTS}/orders-by-status?startDate=${startDate}&endDate=${endDate}`
            );

            const ordersByStatus = response.data;

            // Construir el objeto de KPIs - SOLO los 5 que necesitas
            const kpis: OrderKPIs = {
                totalOrders: 0,
                pendingOrders: 0,
                paidOrders: 0,
                shippedOrders: 0,
                deliveredOrders: 0
            };

            // Mapear los datos del reporte a los KPIs
            ordersByStatus.forEach((item: any) => {
                const count = item.orderCount || 0;
                
                switch (item.status) {
                    case 'PENDING':
                        kpis.pendingOrders = count;
                        break;
                    case 'PAID':
                        kpis.paidOrders = count;
                        break;
                    case 'SHIPPED':
                        kpis.shippedOrders = count;
                        break;
                    case 'DELIVERED':
                        kpis.deliveredOrders = count;
                        break;
                }
                
                kpis.totalOrders += count;
            });

            return kpis;
        } catch (error) {
            console.error('Error fetching order KPIs from reports:', error);
            // Fallback a la opción original si falla
            return this.getOrderKPIs();
        }
    }

    /**
     * OPCIÓN 2: Obtener KPIs haciendo múltiples requests
     * Solo hace 5 requests (uno por cada KPI que necesitas)
     */
    static async getOrderKPIs(): Promise<OrderKPIs> {
        try {
            const [
                totalResponse,
                pendingResponse,
                paidResponse,
                shippedResponse,
                deliveredResponse
            ] = await Promise.all([
                axios.get(`${$URLADMIN}/orders?page=0&size=1`),
                axios.get(`${$URLADMIN}/orders?page=0&size=1&status=PENDING`),
                axios.get(`${$URLADMIN}/orders?page=0&size=1&status=PAID`),
                axios.get(`${$URLADMIN}/orders?page=0&size=1&status=SHIPPED`),
                axios.get(`${$URLADMIN}/orders?page=0&size=1&status=DELIVERED`)
            ]);

            return {
                totalOrders: totalResponse.data.totalElements || 0,
                pendingOrders: pendingResponse.data.totalElements || 0,
                paidOrders: paidResponse.data.totalElements || 0,
                shippedOrders: shippedResponse.data.totalElements || 0,
                deliveredOrders: deliveredResponse.data.totalElements || 0
            };
        } catch (error) {
            console.error('Error fetching order KPIs:', error);
            return {
                totalOrders: 0,
                pendingOrders: 0,
                paidOrders: 0,
                shippedOrders: 0,
                deliveredOrders: 0
            };
        }
    }

    static async getUserOrders(
        page: number = 0,
        size: number = 10,
        status?: string,
        startDate?: string,
        endDate?: string,
        searchQuery?: string
    ): Promise<PaginatedResponse<OrderResponse>> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });
            
            if (status && status !== 'all') {
                params.append('status', status.toUpperCase());
            }
            
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
            
            if (searchQuery && searchQuery.trim()) {
                params.append('searchQuery', searchQuery.trim());
            }
            
            const response = await axios.get(`${$URL}/get?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async updateOrderStatus(orderId: number, status: string): Promise<void> {
        try {
            await axios.put(`${$URLADMIN}/orders/${orderId}/status?status=${status}`);
        } catch (error) {
            throw error;
        }
    }

    static async getUserOrderStatistics() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${$URL}/statistics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order statistics');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching order statistics:', error);
            throw error;
        }
    }
}

export default OrderService;