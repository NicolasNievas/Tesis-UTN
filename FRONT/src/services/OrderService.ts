import axios from 'axios';
import { OrderResponse, PaginatedResponse } from '@/interfaces/data.interfaces';

const $URLADMIN = process.env.NEXT_PUBLIC_API_URL_ADMIN;
const $URL = process.env.NEXT_PUBLIC_API_URL_ORDERS;

class OrderService {
    static async getAllOrders(
        page: number = 0,
        size: number = 5,
        status?: string,
    ): Promise<PaginatedResponse<OrderResponse>> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });
            if (status && status !== 'ALL') {
                params.append('status', status);
            }
            const response = await axios.get(`${$URLADMIN}/orders?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    static async getUserOrders(): Promise<OrderResponse[]> {
        try {
            const response = await axios.get(`${$URL}/get`);
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
}

export default OrderService;