'use client'
import { useEffect, useState } from 'react';
import { withAdmin } from '@/hoc/isAdmin';
import OrderService from '@/services/OrderService';
import { OrderResponse } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';
import OrderDetailsModal from '@/components/organisms/OrderDetailsModal';
import { Package, Truck, Calendar, Mail, Clock, DollarSign } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await OrderService.getAllOrders();
            setOrders(data);
        } catch (error) {
            toast.error('Error loading orders');
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (order: OrderResponse) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const formatDate = (dateArray: any) => {
        if (Array.isArray(dateArray)) {
            const [year, month, day, hour, minute, second] = dateArray;
            const date = new Date(year, month - 1, day, hour, minute, second);
            return date.toLocaleString('es-AR', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            });
        } else if (typeof dateArray === 'string') {
            const date = new Date(dateArray);
            return date.toLocaleString('es-AR', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            });
        }
        return 'Fecha no disponible';
    };

    const getStatusStyles = (status: string) => {
        const baseStyles = "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 w-fit";
        switch (status) {
            case 'COMPLETED':
                return `${baseStyles} bg-green-100 text-green-800 border border-green-200`;
            case 'PENDING':
                return `${baseStyles} bg-yellow-100 text-yellow-800 border border-yellow-200`;
            case 'CANCELLED':
                return `${baseStyles} bg-red-100 text-red-800 border border-red-200`;
            default:
                return `${baseStyles} bg-blue-100 text-blue-800 border border-blue-200`;
        }
    };

    const getShippingStatus = (status: string) => {
        switch (status) {
            case 'LOCAL_PICKUP':
                return 'Local Pickup';
            case 'HOME_DELIVERY':
                return 'Home Delivery';
            default:
                return 'N/A';
        }
    };
    

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
                <span className="text-sm text-gray-500">Total Orders: {orders.length}</span>
            </div>
            
            <div className="grid gap-6">
                {orders.map((order) => (
                    <div key={order.id} 
                         className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 items-center">
                                {/* Date Column */}
                                <div className="flex items-center gap-4">
                                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-[120px]">
                                        <div className="text-sm font-medium text-gray-600">Date</div>
                                        <div className="text-gray-900">{formatDate(order.date)}</div>
                                    </div>
                                </div>

                                {/* Customer Contact */}
                                <div className="flex items-center gap-8">
                                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-[140px]">
                                        <div className="text-sm font-medium text-gray-600">Customer</div>
                                        <div className="text-gray-900 truncate max-w-[180px]">
                                            {order.customer?.email || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-4">
                                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-[100px]">
                                        <div className="text-sm font-medium text-gray-600">Status</div>
                                        <div className={getStatusStyles(order.status)}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping */}
                                <div className="flex items-center gap-4">
                                    <Truck className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-[120px]">
                                        <div className="text-sm font-medium text-gray-600">Shipping</div>
                                        <div className="text-gray-900">
                                            {getShippingStatus(order.shippingName)}
                                        </div>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex items-center gap-4">
                                    <DollarSign className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-[80px]">
                                        <div className="text-sm font-medium text-gray-600">Total</div>
                                        <div className="text-gray-900 font-medium">
                                            ${order.total.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleOpenModal(order)}
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 
                                                 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                    >
                                        <Package className="w-4 h-4" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default withAdmin(AdminOrders);