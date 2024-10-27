import axios from 'axios';
import { OrderResponse } from '@/interfaces/data.interfaces';

const $URLADMIN = process.env.NEXT_PUBLIC_API_URL_ADMIN;
const $URL = process.env.NEXT_PUBLIC_API_URL_ORDERS;

class OrderService {
    static async getAllOrders(): Promise<OrderResponse[]> {
        try {
            const response = await axios.get(`${$URLADMIN}/orders`);
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
}

export default OrderService;