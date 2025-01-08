/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useState } from 'react';
import { Calendar, Package, Truck, CreditCard, AlertCircle } from 'lucide-react';
import OrderService from '@/services/OrderService';
import { OrderResponse } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';
import Line from '@/components/atoms/Line';

const UserOrders = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await OrderService.getUserOrders();
            setOrders(data);
        } catch (error) {
            toast.error('Error loading your orders');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateArray: string | number[]  ) => {
        if (Array.isArray(dateArray)) {
            const [year, month, day] = dateArray;
            return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return 'Date not available';
    };

    const getStatusStyles = (status: string) => {
        const baseStyles = "px-3 py-1 rounded-full text-sm font-medium";
        switch (status) {
            case 'COMPLETED':
                return `${baseStyles} bg-green-100 text-green-800`;
            case 'PENDING':
                return `${baseStyles} bg-yellow-100 text-yellow-800`;
            case 'IN_PROCESS':
                return `${baseStyles} bg-blue-100 text-blue-800`;
            case 'CANCELLED':
                return `${baseStyles} bg-red-100 text-red-800`;
            default:
                return `${baseStyles} bg-gray-100 text-gray-800`;
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

    const getPaymentStatus = (status: string) => {
        switch (status) {
            case 'CREDIT_CARD':
                return 'Credit Card';
            case 'DEBIT_CARD':
                return 'Debit Card';
            case 'ACCOUNT_MONEY':
                return 'Account Money In Mercado Pago';
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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                <span className="text-sm text-gray-500">Total Orders: {orders.length}</span>
            </div>
            <Line />
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        {/* Order Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-center">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Order Date</p>
                                        <p className="font-medium text-gray-900">{formatDate(order.date)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-medium text-gray-900">#{order.paymentId}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Shipping</p>
                                        <p className="font-medium text-gray-900">{getShippingStatus(order.shippingName)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Payment</p>
                                        <p className="font-medium text-gray-900">{getPaymentStatus(order.paymentMethodName)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <div className={getStatusStyles(order.status)}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
                            >
                                {expandedOrder === order.id ? 'Hide Details' : 'Show Details'}
                            </button>
                        </div>

                        {/* Order Details */}
                        {expandedOrder === order.id && (
                            <div className="p-6 bg-gray-50">
                                <div className="space-y-6">
                                    {order.details.map((detail) => (
                                        <div key={detail.id} className="flex items-center gap-6 bg-white p-4 rounded-lg shadow-sm">
                                            {detail.imageUrl && (
                                                <img 
                                                    src={detail.imageUrl} 
                                                    alt={detail.productName}
                                                    className="w-24 h-24 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-grow">
                                                <h3 className="font-medium text-gray-900">{detail.productName}</h3>
                                                <div className="mt-1 grid grid-cols-3 gap-4 text-sm text-gray-500">
                                                    <p>Quantity: {detail.quantity}</p>
                                                    <p>Price: ${detail.price.toFixed(2)}</p>
                                                    <p>Subtotal: ${detail.subtotal.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-end border-t border-gray-100 pt-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Order Amount</p>
                                            <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                    <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
                </div>
            )}
        </div>
    );
};

export default UserOrders;