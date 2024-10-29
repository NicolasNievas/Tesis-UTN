import axios from 'axios';
import { OrderResponse, PaginatedResponse } from '@/interfaces/data.interfaces';

const $URLADMIN = process.env.NEXT_PUBLIC_API_URL_ADMIN;
const $URL = process.env.NEXT_PUBLIC_API_URL_ORDERS;

class OrderService {
    static async getAllOrders(
        page: number = 0,
        size: number = 10,
        startDate?: string,
        endDate?: string,
        status?: string
    ): Promise<PaginatedResponse<OrderResponse>> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });
            
            // Only add dates if they're not empty
            if (startDate && startDate.trim() !== '') {
                params.append('startDate', startDate);
            }
            if (endDate && endDate.trim() !== '') {
                params.append('endDate', endDate);
            }
            if (status && status !== 'ALL') {
                params.append('status', status);
            }
            
            const response = await axios.get(`${$URLADMIN}/orders?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default OrderService;