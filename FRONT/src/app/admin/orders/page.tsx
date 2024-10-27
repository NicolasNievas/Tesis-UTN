'use client'
import { useEffect, useState } from 'react';
import { withAdmin } from "@/hoc/isAdmin";
import OrderService from '@/services/OrderService';
import { OrderResponse } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';
import OrderDetailsModal from '@/components/organisms/OrderDetailsModal';

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
                // hour: '2-digit',
                // minute: '2-digit'
            });
        } else if (typeof dateArray === 'string') {
            const date = new Date(dateArray);
            return date.toLocaleString('es-AR', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                // hour: '2-digit',
                // minute: '2-digit'
            });
        }
        return 'Fecha no disponible';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Orders Management</h1>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            {/* <th className="px-6 py-3 text-left">Order ID</th> */}
                            <th className="px-6 py-3 text-left">Date</th>
                            {/* <th className="px-6 py-3 text-left">Customer</th> */}
                            <th className="px-6 py-3 text-left">Contact</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            {/* <th className="px-6 py-3 text-left">Payment</th> */}
                            <th className="px-6 py-3 text-left">Shipping</th>
                            <th className="px-6 py-3 text-left">Total</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                {/* <td className="px-6 py-4">{order.id}</td> */}
                                <td className="px-6 py-4">
                                    {formatDate(order.date)}
                                </td>
                                {/* <td className="px-6 py-4">
                                    {order.customer ? (
                                        `${order.customer.firstName} ${order.customer.lastName}`
                                    ) : 'N/A'}
                                </td> */}
                                <td className="px-6 py-4">
                                    {order.customer ? (
                                        <div>
                                            <div>{order.customer.email}</div>
                                            {/* <div className="text-sm text-gray-500">
                                                {order.customer.phoneNumber || 'No phone'}
                                            </div> */}
                                        </div>
                                    ) : 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        order.status === 'COMPLETED' ? 'bg-green-200 text-green-800' :
                                        order.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                                        order.status === 'CANCELLED' ? 'bg-red-200 text-red-800' :
                                        'bg-blue-200 text-blue-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                {/* <td className="px-6 py-4">{order.paymentMethodName}</td> */}
                                <td className="px-6 py-4">{order.shippingName}</td>
                                <td className="px-6 py-4">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleOpenModal(order)}
                                        className="text-blue-600 hover:text-blue-800 mr-2"
                                    >
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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