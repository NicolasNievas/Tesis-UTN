"use client";
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import PurchaseOrderService from '@/services/PurchaseOrderService';
import { fetchActiveProductsOrder } from '@/services/ProductService';
import axios from 'axios';
import { Plus, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { ProviderOrderDetail, PurchaseOrderResponse, SimulatedDeliveryDetail } from '@/interfaces/data.interfaces';
import { withAdmin } from '@/hoc/isAdmin';
import Line from '@/components/atoms/Line';

const $URL = process.env.NEXT_PUBLIC_API_URL_PROVIDER;

const PurchaseOrderManagement = () => {
  interface PurchaseOrder {
    orderId: number;
    status: string;
    orderDate: string;
    expectedDeliveryDays: number;
    simulatedDelivery: SimulatedDeliveryDetail[];
  }
  
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [providers, setProviders] = useState<{ id: number; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [items, setItems] = useState([{ productId: '', requestedQuantity: '', purchasePrice: '' }]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const providersResponse = await axios.get(`${$URL}/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const productsData = await fetchActiveProductsOrder();
        setProviders(providersResponse.data);
        setProducts(productsData);
      } catch (err) {
        console.log(err);
        toast.error("Error loading initial data");
      }
    };
    fetchData();
  }, []);

  const addItem = () => setItems([...items, { productId: '', requestedQuantity: '', purchasePrice: '' }]);

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof typeof items[0], value: unknown) => {
    const newItems = [...items];
    newItems[index][field] = value as string;
    setItems(newItems);
  };

  const createOrder = async () => {
    try {
      if (selectedProvider !== null) {
        // Convert string values to numbers and create ProviderOrderDetail array
        const formattedItems: ProviderOrderDetail[] = items.map(item => ({
          productId: parseInt(item.productId),
          requestedQuantity: parseInt(item.requestedQuantity),
          purchasePrice: parseFloat(item.purchasePrice)
        }));

        // Validate the converted values
        const isValid = formattedItems.every(item => 
          !isNaN(item.productId) && 
          !isNaN(item.requestedQuantity) && 
          !isNaN(item.purchasePrice)
        );

        if (!isValid) {
          toast.error("Please enter valid numbers for all fields");
          return;
        }

        const response = await PurchaseOrderService.createOrder(selectedProvider, formattedItems);
        
        const newOrder: PurchaseOrder = {
          orderId: response.orderId,
          status: response.status,
          orderDate: response.orderDate,
          expectedDeliveryDays: response.expectedDeliveryDays,
          simulatedDelivery: response.simulatedDelivery,
        };

        setOrders([...orders, newOrder]);
        toast.success("Order created successfully");
      } else {
        toast.error("Please select a provider");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error creating order");
    }
  };

  const simulateDelivery = async (orderId: number) => {
    try {
      const response = await PurchaseOrderService.simulateDelivery(orderId);
      setOrders(orders.map(order => order.orderId === orderId ? { ...order, ...response } : order));
      toast.success("Simulation completed");
    } catch (error) {
      console.log(error);
      toast.error("Error simulating delivery");
    }
  };

  const confirmDelivery = async (orderId: number, deliveryDetails: { productId: number; receivedQuantity: number }[]) => {
    try {
      const response = await PurchaseOrderService.confirmDelivery(orderId, deliveryDetails);
      console.log(response);
      setOrders(orders.map(order => order.orderId === orderId ? { ...order, status: 'COMPLETED' } : order));
      toast.success("Delivery confirmed and stock updated");
    } catch (error) {
      console.log(error);
      toast.error("Error confirming delivery");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <ToastContainer />
      <header>
        <h1 className="text-3xl font-bold">Purchase Order Management</h1>
      </header>

      <Line />

      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-bold">New Purchase Order</h2>
        <div className="space-y-6">
          <div>
            <label>Provider</label>
            <select onChange={(e) => setSelectedProvider(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white">
              <option value="">Select a provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
          </div>
          <div>
            <OrderItems items={items} products={products} updateItem={updateItem} removeItem={removeItem} addItem={addItem} />
          </div>
          <button onClick={createOrder} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Create Order
          </button>
        </div>
      </section>

      <div className="grid gap-6">
        {orders.map(order => (
          <OrderCard
            key={order.orderId}
            order={order}
            onSimulate={() => simulateDelivery(order.orderId)}
            onConfirm={(receivedItems) => confirmDelivery(order.orderId, receivedItems)}
          />
        ))}
      </div>
    </div>
  );
};

interface OrderItem {
  productId: string;
  requestedQuantity: string;
  purchasePrice: string;
}

const OrderItems = ({ items, products, updateItem, removeItem, addItem }: { items: OrderItem[], products: unknown[], updateItem: (index: number, field: keyof OrderItem, value: unknown) => void, removeItem: (index: number) => void, addItem: () => void }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Products</h3>
      <button onClick={addItem} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
        <Plus size={16} />
        Add Product
      </button>
    </div>
    {items.map((item, index) => (
      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
        <select value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)} className="p-2 border rounded-lg">
          <option value="">Select a product</option>
          {Array.isArray(products) && products.map(product => (
            <option key={(product as { id: number; name: string }).id} value={(product as { id: number; name: string }).id}>{(product as { id: number; name: string }).name}</option>
          ))}
        </select>
        <input type="number" value={item.requestedQuantity} onChange={(e) => updateItem(index, 'requestedQuantity', e.target.value)} placeholder="Quantity" className="p-2 border rounded-lg" />
        <input type="number" value={item.purchasePrice} onChange={(e) => updateItem(index, 'purchasePrice', e.target.value)} placeholder="Unit Price" className="p-2 border rounded-lg" />
        <button onClick={() => removeItem(index)} className="text-red-600 hover:bg-red-50 rounded-lg p-2">
          <Trash2 size={20} />
        </button>
      </div>
    ))}
  </div>
);

interface OrderCardProps {
  order: PurchaseOrderResponse;
  onSimulate: () => void;
  onConfirm: (receivedItems: { productId: number; receivedQuantity: number }[]) => Promise<void>;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onSimulate, onConfirm }) => {
  const [isSimulated, setIsSimulated] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleSimulateClick = async () => {
    await onSimulate();
    const calculatedTotal = order.simulatedDelivery.reduce((acc, item) => {
      if (item.status !== "NOT_AVAILABLE") {
        return acc + (item.finalPrice * item.expectedQuantity);
      }
      return acc;
    }, 0);
    setTotalPrice(calculatedTotal);
    setIsSimulated(true);
  };

  const handleConfirmClick = async () => {
    const receivedItems = order.simulatedDelivery
      .filter((item) => item.status !== "NOT_AVAILABLE")
      .map((item) => ({
        productId: item.productId,
        receivedQuantity: item.expectedQuantity,
      }));

    await onConfirm(receivedItems);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Order #{order.orderId}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={handleSimulateClick} className="inline-flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
          <RefreshCw size={18} />
          Simulate Delivery
        </button>
        {order.status === 'PENDING' && (
          <button onClick={handleConfirmClick} className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            <CheckCircle size={18} />
            Confirm Delivery
          </button>
        )}
      </div>

      {isSimulated && (
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-lg">Simulation Details</h4>
          {order.simulatedDelivery.map((item) => (
            <div key={item.productId} className="p-4 border rounded-lg">
              <div className="flex justify-between">
                <h5 className="font-medium">{item.productName}</h5>
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="block text-gray-500">Requested</span>
                  {item.requestedQuantity}
                </div>
                <div>
                  <span className="block text-gray-500">Delivered</span>
                  {item.expectedQuantity}
                </div>
                <div>
                  <span className="block text-gray-500">Unit Price</span>
                  ${item.finalPrice.toFixed(2)}
                </div>
                <div>
                  <span className="block text-gray-500">Status</span>
                  {item.statusMessage}
                </div>
              </div>
            </div>
          ))}
          <div className="mt-4 text-right">
            <span className="text-lg font-semibold">Simulated Total: ${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAdmin(PurchaseOrderManagement);