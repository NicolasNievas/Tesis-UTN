import axios from 'axios';
import { OrderResponse } from '@/interfaces/data.interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL_ADMIN;

class OrderService {
    static async getAllOrders(): Promise<OrderResponse[]> {
        try {
            const response = await axios.get(`${API_URL}/orders`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default OrderService;