import React, { useState } from 'react';
import Image from 'next/image';
import { OrderResponse } from '@/interfaces/data.interfaces';
import Line from '../atoms/Line';
import { User, Mail, Phone, MapPin, Building, ChevronDown } from 'lucide-react';
import OrderStatusUpdate from './OrderStatusUpdate';

interface OrderDetailsModalProps {
    order: OrderResponse;
    onClose: () => void;
    isOpen: boolean;
    onOrderUpdated?: (updatedOrder: OrderResponse) => void;
}

const OrderDetailsModal = ({ order, onClose, isOpen, onOrderUpdated  }: OrderDetailsModalProps) => {
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    if (!isOpen) return null;

    const formatDate = (dateArray: unknown) => {
        if (Array.isArray(dateArray)) {
            const [year, month, day, hour, minute, second] = dateArray;
            const date = new Date(year, month - 1, day, hour, minute, second);
            return date.toLocaleString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (typeof dateArray === 'string') {
            const date = new Date(dateArray);
            return date.toLocaleString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return 'Fecha no disponible';
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

    // const handleStatusUpdate = (updatedOrder: OrderResponse) => {
    //     if (onOrderUpdated) {
    //       onOrderUpdated(updatedOrder);
    //     }
    // };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-white">
                {/* Header */}
                <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
                    <h2 className="text-2xl font-bold text-white">Order Details #{order.mercadoPagoOrderId}</h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Date */}
                        <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-600 transition-colors">
                            <div className="flex-shrink-0 text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-300">Date</p>
                                <p className="text-base text-white">{formatDate(order.date)}</p>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-600 transition-colors">
                            <div className="flex-shrink-0 text-green-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13"/>
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                    <circle cx="5.5" cy="18.5" r="2.5"/>
                                    <circle cx="18.5" cy="18.5" r="2.5"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-300">Shipping Method</p>
                                <p className="text-base text-white">{getShippingStatus(order.shippingName)}</p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-600 transition-colors">
                            <div className="flex-shrink-0 text-purple-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                    <line x1="1" y1="10" x2="23" y2="10"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-300">Payment Method</p>
                                <p className="text-base text-white">{getPaymentStatus(order.paymentMethodName)}</p>
                            </div>
                        </div>

                        {/* Status card */}
                        <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-600 transition-colors relative">
                            <div className="flex-shrink-0 text-yellow-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-300">Status</p>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        order.status === 'COMPLETED' ? 'bg-green-900 text-green-200' :
                                        order.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' :
                                        order.status === 'CANCELLED' ? 'bg-red-900 text-red-200' :
                                        'bg-blue-900 text-blue-200'
                                        }`}>
                                            {order.status}
                                    </span>
                                    <button 
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)} 
                                    className="text-gray-400 hover:text-white"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>
                            {showStatusDropdown && (
                                <div className="absolute top-full left-0 mt-2  z-50">
                                    <OrderStatusUpdate
                                    order={order}
                                    onStatusUpdated={onOrderUpdated || (() => {})}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <Line />
                    
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Customer Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-600 transition-colors">
                                <div className="flex-shrink-0 text-indigo-400">
                                    <User size={24} />
                                </div>
                                <div>
                                <p className="text-sm font-medium text-gray-300">Name</p>
                                <p className="text-base text-white">
                                    {order.customer.firstName} {order.customer.lastName}
                                </p>
                                </div>
                            </div>
                            
                            {/* Email */}
                            <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-600 transition-colors">
                                <div className="flex-shrink-0 text-blue-400">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-300">Email</p>
                                    <p className="text-base text-white truncate max-w-[250px]">
                                        {order.customer.email}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Phone */}
                            <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-600 transition-colors">
                                <div className="flex-shrink-0 text-green-400">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-300">Phone</p>
                                    <p className="text-base text-white">
                                        {order.customer.phoneNumber || 'Not provided'}
                                    </p>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-600 transition-colors">
                                <div className="flex-shrink-0 text-orange-400">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-300">Address</p>
                                    <p className="text-base text-white">
                                        {order.customer.address}
                                    </p>
                                </div>
                            </div>

                            {/* City */}
                            <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-600 transition-colors">
                                <div className="flex-shrink-0 text-purple-400">
                                    <Building size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-300">City</p>
                                    <p className="text-base text-white">
                                        {order.customer.city}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Line />

                    {/* Products */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Products</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-gray-700 border border-gray-600 rounded-lg">
                                <thead className="bg-gray-600">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Image</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Product</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Quantity</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Price</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-600">
                                    {order.details.map((detail) => (
                                        <tr key={detail.id} className="hover:bg-gray-600 transition-colors">
                                            <td className="px-6 py-4">
                                                {detail.imageUrl ? (
                                                    <img src={detail.imageUrl} alt={detail.productName} className="h-16 w-16 object-cover rounded" />
                                                ) : (
                                                    <div className="h-16 w-16 bg-gray-600 rounded flex items-center justify-center text-gray-400">
                                                        No image
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-white">{detail.productName}</td>
                                            <td className="px-6 py-4 text-white">{detail.quantity}</td>
                                            <td className="px-6 py-4 text-white">${detail.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-white">${detail.subtotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-600">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-right font-medium text-gray-300">Total:</td>
                                        <td className="px-6 py-4 font-bold text-white">${order.total.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700 flex justify-end sticky bottom-0 bg-gray-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;