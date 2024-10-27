'use client'
import React from 'react';
import { OrderResponse } from '@/interfaces/data.interfaces';


interface OrderDetailsModalProps {
    order: OrderResponse;
    onClose: () => void;
    isOpen: boolean;
}

const OrderDetailsModal = ({ order, onClose, isOpen }: OrderDetailsModalProps) => {
    if (!isOpen) return null;

    const formatDate = (dateArray: any) => {
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold">Order Details #{order.id}</h2>
                    
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Order Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p><span className="font-medium">Date:</span> {formatDate(order.date)}</p>
                                <p><span className="font-medium">Status:</span> 
                                    <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                                        order.status === 'COMPLETED' ? 'bg-green-200 text-green-800' :
                                        order.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                                        order.status === 'CANCELLED' ? 'bg-red-200 text-red-800' :
                                        'bg-blue-200 text-blue-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </p>
                                <p><span className="font-medium">Payment Method:</span> {order.paymentMethodName}</p>
                                <p><span className="font-medium">Shipping Method:</span> {order.shippingName}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Information</h3>
        <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="font-medium">Name:</span> {order.customer.firstName} {order.customer.lastName}</div>
          <div><span className="font-medium">Email:</span> {order.customer.email}</div>
          <div><span className="font-medium">Phone:</span> {order.customer.phoneNumber || 'Not provided'}</div>
          <div><span className="font-medium">Address:</span> {order.customer.address}</div>
          <div><span className="font-medium">City:</span> {order.customer.city}</div>
        </div>
      </div>
                    </div>

                    {/* Products */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Products</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.details.map((detail) => (
                                        <tr key={detail.id}>
                                            <td className="px-6 py-4">
                                                {detail.productImage ? (
                                                    <img
                                                        src={detail.productImage}
                                                        alt={detail.productName}
                                                        className="h-16 w-16 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                                                        No image
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">{detail.productName}</td>
                                            <td className="px-6 py-4">{detail.quantity}</td>
                                            <td className="px-6 py-4">${detail.price.toFixed(2)}</td>
                                            <td className="px-6 py-4">${detail.subtotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-right font-medium">Total:</td>
                                        <td className="px-6 py-4 font-bold">${order.total.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;