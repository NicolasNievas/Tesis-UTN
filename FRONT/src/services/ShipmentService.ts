import { CreateShipmentRequest, ShipmentResponse, ShipmentStatus, UpdateShipmentStatusRequest } from '@/interfaces/data.interfaces';
import JWTService from '@/jwt/JwtService';
import axios from 'axios';

const $URL_ADMIN = process.env.NEXT_PUBLIC_API_URL_ADMIN; 
const $URL = process.env.NEXT_PUBLIC_API_URL_SHIPMENT;

class ShipmentService {
    static async createShipment(request: CreateShipmentRequest): Promise<ShipmentResponse>{
        try{
            const token = JWTService.getToken();
            const response = await axios.post(`${$URL_ADMIN}/shipments/create`, request, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }catch (error) {
            console.error('Error creating shipment:', error);
            throw error;
        }
    }

    static async updateShipmentStatus(shipmentId: number, request: UpdateShipmentStatusRequest): Promise<ShipmentResponse> {
        try {
            const token = JWTService.getToken();
            const response = await axios.put(
                `${$URL_ADMIN}/shipments/${shipmentId}/status`, 
                request,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating shipment status:', error);
            throw error;
        }
    }

    static async trackShipment(trackingCode: string): Promise<ShipmentResponse> {
        try {
            const response = await axios.get(`${$URL}/track/${trackingCode}`);
            return response.data;
        } catch (error) {
            console.error('Error tracking shipment:', error);
            throw error;
        }
    }

    static async getShipmentByOrderId(orderId: number): Promise<ShipmentResponse> {
        try {
            const token = JWTService.getToken();
            const response = await axios.get(`${$URL}/order/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting shipment:', error);
            throw error;
        }
    }

    static translateStatus(status: ShipmentStatus): string {
        const translations: Record<ShipmentStatus, string> = {
            [ShipmentStatus.PENDING]: 'Pending',
            [ShipmentStatus.PROCESSING]: 'Processing',
            [ShipmentStatus.READY_FOR_PICKUP]: 'Ready for Pickup',
            [ShipmentStatus.IN_TRANSIT]: 'In Transit',
            [ShipmentStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
            [ShipmentStatus.DELIVERED]: 'Delivered',
            [ShipmentStatus.FAILED_DELIVERY]: 'Failed Delivery',
            [ShipmentStatus.RETURNED]: 'Returned',
            [ShipmentStatus.CANCELLED]: 'Cancelled'
        };
        return translations[status] || status;
    }

    // Obtener color según el estado
    static getStatusColor(status: ShipmentStatus): string {
        const colors: Record<ShipmentStatus, string> = {
            [ShipmentStatus.PENDING]: 'text-gray-600 bg-gray-100',
            [ShipmentStatus.PROCESSING]: 'text-blue-600 bg-blue-100',
            [ShipmentStatus.READY_FOR_PICKUP]: 'text-purple-600 bg-purple-100',
            [ShipmentStatus.IN_TRANSIT]: 'text-yellow-600 bg-yellow-100',
            [ShipmentStatus.OUT_FOR_DELIVERY]: 'text-orange-600 bg-orange-100',
            [ShipmentStatus.DELIVERED]: 'text-green-600 bg-green-100',
            [ShipmentStatus.FAILED_DELIVERY]: 'text-red-600 bg-red-100',
            [ShipmentStatus.RETURNED]: 'text-gray-600 bg-gray-100',
            [ShipmentStatus.CANCELLED]: 'text-red-600 bg-red-100'
        };
        return colors[status] || 'text-gray-600 bg-gray-100';
    }
}

export default ShipmentService;