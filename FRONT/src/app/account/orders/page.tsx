/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useState } from 'react';
import { 
  Calendar, Package, Truck, CreditCard, AlertCircle, 
  ShoppingCart, Clock, CheckCircle, DollarSign, 
  MapPin, User, Mail, Phone, ExternalLink,
  ChevronDown, ChevronUp, Box, FileText,
  RefreshCw, Filter,
  Star,
  RotateCcw,
  ShoppingBag
} from 'lucide-react';
import OrderService from '@/services/OrderService';
import CartService from '@/services/CartService';
import { OrderResponse } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/data.context';

interface OrderStatistics {
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
    inProcessOrders: number;
    cancelledOrders: number;
}

const UserOrders = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'in_process' | 'cancelled'>('all');
    const [reorderingOrderId, setReorderingOrderId] = useState<number | null>(null);
    const router = useRouter();
    const { getCart } = useAuthContext();

    useEffect(() => {
        loadOrders();
        loadStatistics();
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

    const loadStatistics = async () => {
        try {
            const data = await OrderService.getUserOrderStatistics();
            setStatistics(data);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    const formatDate = (dateArray: string | number[]) => {
        if (Array.isArray(dateArray)) {
            const [year, month, day] = dateArray;
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            });
        }
        return 'Date not available';
    };

    const getStatusStyles = (status: string) => {
        const baseStyles = "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5";
        switch (status) {
            case 'PAID':
                return `${baseStyles} bg-blue-100 text-blue-800 border border-blue-200`;
            case 'PROCESSING':
                return `${baseStyles} bg-purple-100 text-purple-800 border border-purple-200`;
            case 'SHIPPED':
                return `${baseStyles} bg-yellow-100 text-yellow-800 border border-yellow-200`;
            case 'DELIVERED':
                return `${baseStyles} bg-green-100 text-green-800 border border-green-200`;
            case 'PENDING':
                return `${baseStyles} bg-yellow-100 text-yellow-800 border border-yellow-200`;
            case 'CANCELLED':
                return `${baseStyles} bg-red-100 text-red-800 border border-red-200`;
            case 'COMPLETED':
                return `${baseStyles} bg-green-100 text-green-800 border border-green-200`;
            default:
                return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID':
                return <DollarSign className="w-3.5 h-3.5" />;
            case 'PROCESSING':
                return <RefreshCw className="w-3.5 h-3.5" />;
            case 'SHIPPED':
                return <Truck className="w-3.5 h-3.5" />;
            case 'DELIVERED':
            case 'COMPLETED':
                return <CheckCircle className="w-3.5 h-3.5" />;
            case 'PENDING':
                return <Clock className="w-3.5 h-3.5" />;
            case 'CANCELLED':
                return <AlertCircle className="w-3.5 h-3.5" />;
            default:
                return <Clock className="w-3.5 h-3.5" />;
        }
    };

    const getShippingInfo = (shippingName: string) => {
        switch (shippingName) {
            case 'LOCAL_PICKUP':
                return { 
                    name: 'Store Pickup', 
                    icon: <Package className="w-4 h-4" />,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50'
                };
            case 'OCA':
                return { 
                    name: 'OCA Shipping', 
                    icon: <Truck className="w-4 h-4" />,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50'
                };
            case 'CORREO_ARGENTINO':
                return { 
                    name: 'Argentine Mail', 
                    icon: <Truck className="w-4 h-4" />,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50'
                };
            case 'ANDREANI':
                return { 
                    name: 'Andreani', 
                    icon: <Truck className="w-4 h-4" />,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50'
                };
            default:
                return { 
                    name: shippingName || 'Not specified', 
                    icon: <Truck className="w-4 h-4" />,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50'
                };
        }
    };

    const getPaymentInfo = (method: string) => {
        switch (method) {
            case 'CREDIT_CARD':
                return { 
                    name: 'Credit Card', 
                    icon: <CreditCard className="w-4 h-4" />,
                    color: 'text-indigo-600'
                };
            case 'DEBIT_CARD':
                return { 
                    name: 'Debit Card', 
                    icon: <CreditCard className="w-4 h-4" />,
                    color: 'text-blue-600'
                };
            case 'ACCOUNT_MONEY':
                return { 
                    name: 'Mercado Pago', 
                    icon: <DollarSign className="w-4 h-4" />,
                    color: 'text-green-600'
                };
            default:
                return { 
                    name: method || 'N/A', 
                    icon: <CreditCard className="w-4 h-4" />,
                    color: 'text-gray-600'
                };
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter.toUpperCase();
    });

    // Reordenar orden
    const handleReorder = async (orderId: number) => {
        try {
            setReorderingOrderId(orderId);
            await CartService.reorderFromOrder(orderId);
            await getCart();
            toast.success('Order items added to cart successfully');
            setTimeout(() => {
                router.push('/cart');
            }, 1500);
        } catch (error: unknown){
            const err = error as { message?: string };
        if (err.message?.includes('Stock insuficiente') || err.message?.includes('insufficient stock')) {
                const productName = err.message.match(/para (.+?)\./)?.[1] || 'some products';
                const available = err.message.match(/Disponible: (\d+)/)?.[1];
                const requested = err.message.match(/Solicitado: (\d+)/)?.[1];
                
                toast.error(
                    <div>
                        <p className="font-medium">Insufficient stock for {productName}</p>
                        <p className="text-sm">Available: {available}, Requested: {requested}</p>
                        <p className="text-sm mt-1">Only available quantity has been added to cart.</p>
                    </div>,
                    { autoClose: 5000 }
                );
                
                setTimeout(() => {
                    router.push('/cart');
                }, 2000);
            } else {
                toast.error('Error adding products to cart. Please try again.');
            }
        } finally {
            setReorderingOrderId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                        <p className="text-gray-600 mt-2">Track and manage all your purchases</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Filter className="w-4 h-4" />
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed' | 'in_process' | 'cancelled')}
                                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Orders</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={loadOrders}
                            className="p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Refresh orders"
                        >
                            <RefreshCw className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
                <div className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* Total Orders */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700 mb-1">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{statistics.totalOrders}</p>
                                <p className="text-xs text-gray-500 mt-2">All time purchases</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Orders */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700 mb-1">Pending</p>
                                <p className="text-3xl font-bold text-gray-900">{statistics.pendingOrders}</p>
                                <p className="text-xs text-gray-500 mt-2">Awaiting confirmation</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Completed Orders */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700 mb-1">Completed</p>
                                <p className="text-3xl font-bold text-gray-900">{statistics.completedOrders}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-xs text-gray-600">Success rate: {Math.round((statistics.completedOrders / statistics.totalOrders) * 100)}%</span>
                                </div>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-700 mb-1">Total Spent</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(statistics.totalSpent)}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Average per order: {formatCurrency(statistics.totalOrders > 0 ? statistics.totalSpent / statistics.totalOrders : 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )} 

            {/* Orders List */}
            <div className="space-y-6">
                {filteredOrders.map((order) => {
                    const shippingInfo = getShippingInfo(order.shippingName);
                    const paymentInfo = getPaymentInfo(order.paymentMethodName);
                    const isExpanded = expandedOrder === order.id;
                    
                    return (
                        <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
                            {/* Order Header */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    {/* Order Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <p className="font-mono font-semibold text-gray-900">#{order.paymentId}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <p className="font-medium text-gray-900">{formatDate(order.date)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping & Payment */}
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Shipping</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${shippingInfo.bgColor}`}>
                                                    {shippingInfo.icon}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{shippingInfo.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-gray-50">
                                                    {paymentInfo.icon}
                                                </div>
                                                <p className="font-medium text-gray-900">{paymentInfo.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Items */}
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                            <div className={getStatusStyles(order.status)}>
                                                {getStatusIcon(order.status)}
                                                {order.status.replace('_', ' ')}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Items</p>
                                            <p className="font-medium text-gray-900 flex items-center gap-2">
                                                <Box className="w-4 h-4" />
                                                {order.details.length} item{order.details.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Total & Actions */}
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total</p>
                                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                                        </div>
                                        <button 
                                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4" />
                                                    Hide Details
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4" />
                                                    View Details
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details - Expanded */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 p-6 bg-gray-50">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Products Section */}
                                        <div className="lg:col-span-2">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                                <Package className="w-5 h-5" />
                                                Order Items ({order.details.length})
                                            </h3>
                                            <div className="space-y-4">
                                                {order.details.map((detail) => (
                                                    <div key={detail.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                                        <div className="flex gap-4">
                                                            {detail.imageUrl && (
                                                                <img 
                                                                    src={detail.imageUrl} 
                                                                    alt={detail.productName}
                                                                    className="w-20 h-20 object-cover rounded-lg"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900">{detail.productName}</h4>
                                                                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                                                    <div>
                                                                        <p className="text-gray-500">Quantity</p>
                                                                        <p className="font-medium text-gray-900">{detail.quantity}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Unit Price</p>
                                                                        <p className="font-medium text-gray-900">{formatCurrency(detail.price)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Subtotal</p>
                                                                        <p className="font-medium text-gray-900">{formatCurrency(detail.subtotal)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Order Summary & Info */}
                                        <div className="space-y-6">
                                            {/* Order Summary */}
                                            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <FileText className="w-5 h-5" />
                                                    Order Summary
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center py-2">
                                                        <span className="text-gray-600">Subtotal</span>
                                                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                                                    </div>
                                                    {order.shippingCost > 0 && (
                                                        <div className="flex justify-between items-center py-2">
                                                            <span className="text-gray-600">Shipping</span>
                                                            <span className="font-medium text-blue-600">{formatCurrency(order.shippingCost)}</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-3 border-t border-gray-200">
                                                        <div className="flex justify-between items-center py-2">
                                                            <span className="font-bold text-gray-900">Total</span>
                                                            <span className="font-bold text-xl text-gray-900">{formatCurrency(order.total)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shipping Address */}
                                            {order.shippingAddress && (
                                                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <MapPin className="w-5 h-5" />
                                                        Shipping Address
                                                    </h4>
                                                    <div className="space-y-2">
                                                        <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {order.shippingCity && (
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    <MapPin className="w-3 h-3 mr-1" />
                                                                    {order.shippingCity}
                                                                </span>
                                                            )}
                                                            {order.shippingPostalCode && (
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                    # {order.shippingPostalCode}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(`${order.shippingAddress}, ${order.shippingCity}`)}`, '_blank')}
                                                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            View on Map
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Customer Info */}
                                            {order.customer && (
                                                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <User className="w-5 h-5" />
                                                        Customer Info
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-700">{order.customer.firstName} {order.customer.lastName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Mail className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-700">{order.customer.email}</span>
                                                        </div>
                                                        {order.customer.phoneNumber && (
                                                            <div className="flex items-center gap-3">
                                                                <Phone className="w-4 h-4 text-gray-400" />
                                                                <span className="text-gray-700">{order.customer.phoneNumber}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Reorder Button */}
                                            {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                                                <div className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
                                                    <div className="text-center">
                                                        <div className="mb-4">
                                                            <RotateCcw className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                            <h4 className="font-semibold text-gray-900 text-lg">Order Again?</h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Add all {order.details.length} item{order.details.length !== 1 ? 's' : ''} from this order to your cart
                                                            </p>
                                                        </div>
                                                        
                                                        <button
                                                            onClick={() => handleReorder(order.id)}
                                                            disabled={reorderingOrderId === order.id}
                                                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                                                                reorderingOrderId === order.id
                                                                    ? 'bg-green-400 cursor-not-allowed'
                                                                    : 'bg-green-600 hover:bg-green-700'
                                                            } text-white`}
                                                        >
                                                            {reorderingOrderId === order.id ? (
                                                                <>
                                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                    Adding to Cart...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ShoppingBag className="w-5 h-5" />
                                                                    Reorder All Items
                                                                </>
                                                            )}
                                                        </button>
                                                        
                                                        <p className="text-xs text-gray-500 mt-3">
                                                            Total: {formatCurrency(order.total)} • {order.details.reduce((total, detail) => total + detail.quantity, 0)} units
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
                <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <ShoppingCart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' 
                                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                                : `You don't have any ${filter.replace('_', ' ')} orders.`
                            }
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Start Shopping
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserOrders;