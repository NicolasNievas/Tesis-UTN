"use client"
import React, { useState } from 'react';
import { OrderResponse } from '@/interfaces/data.interfaces';
import OrderService from '@/services/OrderService';
import { toast } from 'react-toastify';
import { ChevronDown } from 'lucide-react';

interface OrderStatusUpdateProps {
  order: OrderResponse;
  onStatusUpdated: (updatedOrder: OrderResponse) => void;
}

const OrderStatusUpdate = ({ order, onStatusUpdated }: OrderStatusUpdateProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses = ['PENDING', 'IN_PROCESS', 'COMPLETED', 'CANCELLED'] as const;

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) {
      toast.info('No changes to update');
      return;
    }

    setIsUpdating(true);
    try {
      await OrderService.updateOrderStatus(order.id, selectedStatus);
      const updatedOrder = { ...order, status: selectedStatus };
      onStatusUpdated(updatedOrder);
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Error updating order status');
      console.error('Error updating order status:', error);
      setSelectedStatus(order.status); // Reset to original status on error
    } finally {
      setIsUpdating(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-white mb-2">Update Order Status</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:w-48 flex items-center justify-between px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            disabled={isUpdating}
          >
            <span>{selectedStatus}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-gray-600 rounded-lg shadow-lg">
              <ul className="py-2">
                {statuses.map((status) => (
                  <li
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-2 text-white hover:bg-gray-500 cursor-pointer ${
                      selectedStatus === status ? 'bg-gray-500' : ''
                    }`}
                  >
                    {status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button
          onClick={handleStatusUpdate}
          disabled={isUpdating || selectedStatus === order.status}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isUpdating || selectedStatus === order.status
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </div>
  );
};

export default OrderStatusUpdate;