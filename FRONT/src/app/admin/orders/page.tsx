'use client'
import { useEffect, useState } from 'react';
import { withAdmin } from '@/hoc/isAdmin';
import OrderService from '@/services/OrderService';
import { OrderResponse } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';
import OrderDetailsModal from '@/components/organisms/OrderDetailsModal';
import ShipmentModal from '@/components/organisms/ShipmentModal';
import { Package, Truck, Calendar, Mail, Clock, DollarSign, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FilterIcon } from 'lucide-react';
import Line from '@/components/atoms/Line';

const AdminOrders = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
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

    const STATUS_OPTIONS = ['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    useEffect(() => {
        loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, selectedStatus, startDate, endDate]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await OrderService.getAllOrders(
                currentPage,
                pageSize,
                selectedStatus === 'ALL' ? undefined : selectedStatus,
                startDate,
                endDate
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
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedStatus('');
        setCurrentPage(0);
        loadOrders(); // Load orders without filters
    };

    const handleOpenModal = (order: OrderResponse) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleToggleFilter = () => {
        setIsFilterCollapsed((prevState) => !prevState);
    };

    const handleApplyFilters = () => {
        setCurrentPage(0); 
        loadOrders(); 
        setIsFilterCollapsed(true);
    };

    const validateDateRange = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start > end) {
                toast.error('Start date cannot be later than end date');
                return false;
            }
        }
        return true;
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const handleOrderUpdate = (updatedOrder: OrderResponse) => {
        // Update the order in both the orders and filteredOrders arrays
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
            case 'COMPLETED': // Si aún usas COMPLETED para algo
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

    const canViewShipment = (order: OrderResponse) => {
        // Puede ver/actualizar envío si existe
        return order.shipmentInfo?.hasShipment;
    };

    const getShipmentButtonText = (order: OrderResponse) => {
        if (!order.shipmentInfo?.hasShipment) {
            return 'Create Shipment';
        }
        
        // Texto según el estado del envío
        const shipmentStatus = order.shipmentInfo.shipmentStatus;
        if (shipmentStatus === 'DELIVERED' || shipmentStatus === 'CANCELLED') {
            return 'View Shipment';
        }
        return 'Update Shipment';
    };

    const handleOpenShipmentModal = (orderId: number) => {
        setSelectedOrderForShipment(orderId);
        setIsShipmentModalOpen(true);
    };

    const handleCloseShipmentModal = () => {
        setIsShipmentModalOpen(false);
        setSelectedOrderForShipment(null);
        loadOrders(); // Recargar órdenes para actualizar la info de envíos
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
             <div className="flex items-center justify-between  mb-8">
                <h1 className="text-3xl font-bold text-gray-800 ">Orders Management</h1>
                <div className="flex items-center ml-auto gap-4">
                    <div className="relative w-80 ">
                    <button
                    onClick={handleToggleFilter}
                    className="flex items-center justify-between gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 
                    bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-500 w-full transition-colors duration-200"
                    >
                        <FilterIcon className="w-5 h-5" />
                        {isFilterCollapsed ? (
                            <ChevronDown className="w-5 h-5" />
                        ) : (
                        <ChevronUp className="w-5 h-5" />
                        )}
                    </button>
                        {!isFilterCollapsed && (
                            <div className="absolute z-10 top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        max={endDate || undefined}
                                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                        min={startDate || undefined}
                                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                    onClick={() => {
                                        if (validateDateRange()) {
                                            handleApplyFilters();
                                        }
                                    }}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        )}
                        
                    </div>
                    <span className="text-sm text-gray-500 right-48 ">Total Orders: {orders.length}</span>
                </div>
            </div>

            <Line />

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

                                {/* Shipping */}
                                {/* <div className="flex items-center gap-4">
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
                                </div> */}

                                {/* Shipping con tooltip a la derecha */}
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
                                        
                                        {/* Tooltip a la derecha */}
                                        {order.shippingAddress && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                                <div className="font-semibold mb-1">Shipping Address:</div>
                                                <div className="mb-1">{order.shippingAddress}</div>
                                                <div>City: {order.shippingCity}</div>
                                                {order.shippingPostalCode && (
                                                    <div>CP: {order.shippingPostalCode}</div>
                                                )}
                                                {/* Flecha del tooltip */}
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

                                    {/* Botón para crear envío */}
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

                                    {/* Botón para ver/trackear envío existente */}
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
                )) }
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
                        // Puedes añadir lógica adicional aquí si necesitas
                        loadOrders(); // Recargar órdenes
                    }}
                />
            )}

        </div>
    );
};

export default withAdmin(AdminOrders);