'use client'
import { useEffect, useState, useCallback, useRef } from 'react';
import { withAdmin } from '@/hoc/isAdmin';
import OrderService, { OrderKPIs } from '@/services/OrderService';
import { OrderResponse } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';
import OrderDetailsModal from '@/components/organisms/OrderDetailsModal';
import ShipmentModal from '@/components/organisms/ShipmentModal';
import { 
  Package, Truck, Calendar, Mail, Clock, DollarSign, 
  ChevronLeft, ChevronRight, ChevronDown, Search, X,
  ShoppingBag, ClockIcon, CheckCircle, PackageCheck,
} from 'lucide-react';
import Line from '@/components/atoms/Line';

const AdminOrders = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<number | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 5;

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const [kpisLoading, setKpisLoading] = useState(true);

    const STATUS_OPTIONS = ['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

     const [kpis, setKpis] = useState<OrderKPIs>({
        totalOrders: 0,
        pendingOrders: 0,
        paidOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0
    });
    
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(0);
        }, 800);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const loadKPIs = useCallback(async () => {
        try {
            setKpisLoading(true);
            const kpisData = await OrderService.getOrderKPIs();
            setKpis(kpisData);
        } catch (error) {
            console.error('Error loading KPIs:', error);
            toast.error('Error loading statistics');
        } finally {
            setKpisLoading(false);
        }
    }, []);

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            
            const response = await OrderService.getAllOrders(
                currentPage,
                pageSize,
                selectedStatus === 'ALL' ? undefined : selectedStatus,
                startDate,
                endDate,
                debouncedSearchQuery.trim() || undefined
            );
            
            setOrders(response.content);
            setFilteredOrders(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            toast.error('Error loading orders');
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedStatus, startDate, endDate, debouncedSearchQuery]);

     useEffect(() => {
        loadKPIs();
    }, [loadKPIs]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedStatus('');
        setSearchQuery('');
        setDebouncedSearchQuery('');
        setCurrentPage(0);
    };

    const handleOpenModal = (order: OrderResponse) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
        setCurrentPage(0);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
        setCurrentPage(0);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(e.target.value);
        setCurrentPage(0);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setDebouncedSearchQuery('');
        setCurrentPage(0);
    };

    const handleOrderUpdate = (updatedOrder: OrderResponse) => {
        const updateOrderInList = (ordersList: OrderResponse[]) =>
          ordersList.map(order => order.id === updatedOrder.id ? updatedOrder : order);
        
        setOrders(updateOrderInList(orders));
        setFilteredOrders(updateOrderInList(filteredOrders));
        setSelectedOrder(updatedOrder);
    };

    const formatDate = (dateArray: unknown) => {
        if (Array.isArray(dateArray)) {
            const [year, month, day, hour, minute, second] = dateArray;
            const date = new Date(year, month - 1, day, hour, minute, second);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            });
        } else if (typeof dateArray === 'string') {
            const date = new Date(dateArray);
            return date.toLocaleString('en-US', {
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

    const getShippingStatus = (shippingName: string) => {
        switch (shippingName) {
            case 'LOCAL_PICKUP':
                return 'Local Pickup';
            case 'OCA':
                return 'OCA';
            case 'CORREO_ARGENTINO':
                return 'Correo Argentino';
            case 'ANDREANI':
                return 'Andreani';
            default:
                return shippingName || 'Not specified';
        }
    };
    
    const canCreateShipment = (order: OrderResponse) => {
        const canCreate = (order.status === 'PAID' || order.status === 'PROCESSING') && 
                     !order.shipmentInfo?.hasShipment &&
                     order.shippingName !== 'LOCAL_PICKUP';

        return canCreate;
    };

    const handleOpenShipmentModal = (orderId: number) => {
        setSelectedOrderForShipment(orderId);
        setIsShipmentModalOpen(true);
    };

    const handleCloseShipmentModal = () => {
        setIsShipmentModalOpen(false);
        setSelectedOrderForShipment(null);
        loadOrders();
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
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
                </div>

                {/* KPI Cards - SOLO 5 originales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {/* Total Orders */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Total Orders</p>
                                {kpisLoading ? (
                                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{kpis.totalOrders}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">All time orders</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Orders */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Pending</p>
                                {kpisLoading ? (
                                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{kpis.pendingOrders}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <ClockIcon className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Paid Orders */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Paid</p>
                                {kpisLoading ? (
                                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{kpis.paidOrders}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Confirmed payments</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Shipped Orders */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Shipped</p>
                                {kpisLoading ? (
                                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{kpis.shippedOrders}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">In transit</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Truck className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Delivered Orders */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Delivered</p>
                                {kpisLoading ? (
                                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{kpis.deliveredOrders}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
                            </div>
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <PackageCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 sticky top-4 z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        {/* Buscador */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search by Order ID, Payment ID, Email or DNI..."
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {searchQuery !== debouncedSearchQuery && (
                                <p className="text-xs text-gray-400 mt-1">Searching...</p>
                            )}
                        </div>

                        {/* Filtro por Estado */}
                        <div className="w-full md:w-44">
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                    className="w-full pl-3 pr-8 py-2.5 appearance-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                                >
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Filtro por Fecha Desde */}
                        <div className="w-full md:w-36">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    max={endDate || undefined}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="From"
                                />
                            </div>
                        </div>

                        {/* Filtro por Fecha Hasta */}
                        <div className="w-full md:w-36">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    min={startDate || undefined}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="To"
                                />
                            </div>
                        </div>

                        {/* Botón de reset */}
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium flex-1 md:flex-none"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <Line />
            </div>

            {/* Lista de órdenes */}
            <div className="grid gap-6">
                {filteredOrders.map((order) => (
                    <div key={order.id} 
                         className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 items-center">
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

                                {/* Shipping con tooltip */}
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <div className="flex items-center gap-3 cursor-help">
                                            <Truck className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            <div className="min-w-[140px]">
                                                <div className="text-sm font-medium text-gray-600">Shipping</div>
                                                <div className="text-gray-900 font-medium">
                                                    {getShippingStatus(order.shippingName)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {order.shippingAddress && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                                <div className="font-semibold mb-1">Shipping Address:</div>
                                                <div className="mb-1">{order.shippingAddress}</div>
                                                <div>City: {order.shippingCity}</div>
                                                {order.shippingPostalCode && (
                                                    <div>CP: {order.shippingPostalCode}</div>
                                                )}
                                                <div className="absolute top-1/2 -left-2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tracking Info */}
                                <div className="flex items-center gap-3">
                                    <div className="min-w-[140px]">
                                        <div className="text-sm font-medium text-gray-600">Tracking</div>
                                        {order.shipmentInfo?.trackingCode ? (
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-green-600" />
                                                <div>
                                                    <div className="font-mono text-xs font-semibold text-green-600">
                                                        {order.shipmentInfo.trackingCode}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.shipmentInfo.shipmentStatus || 'Active'}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400">No shipment</div>
                                        )}
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
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleOpenModal(order)}
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 
                                                bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                    >
                                        <Package className="w-4 h-4" />
                                        View Details
                                    </button>

                                    {canCreateShipment(order) && (
                                        <button
                                            onClick={() => handleOpenShipmentModal(order.id)}
                                            className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-800 
                                                    bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                        >
                                            <Truck className="w-4 h-4" />
                                            Create Shipment
                                        </button>
                                    )}

                                    {order.shipmentInfo?.hasShipment && (
                                        <button
                                            onClick={() => handleOpenShipmentModal(order.id)}
                                            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-800 
                                                    bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                                        >
                                            <Truck className="w-4 h-4" />
                                            ViewTrack
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {orders.length > 0 && (
                <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-700">
                        Showing {orders.length} of {totalElements} orders
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:bg-gray-50 transition-colors duration-200"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:bg-gray-50 transition-colors duration-200"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onOrderUpdated={handleOrderUpdate}
                />
            )}

            {selectedOrderForShipment && (
                <ShipmentModal
                    orderId={selectedOrderForShipment}
                    isOpen={isShipmentModalOpen}
                    onClose={handleCloseShipmentModal}
                    onShipmentCreated={() => {
                        loadOrders();
                    }}
                />
            )}
        </div>
    );
};

export default withAdmin(AdminOrders);