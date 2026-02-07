import React, { useState, useEffect } from 'react';
import { X, Package, Truck, MapPin, Clock, AlertCircle } from 'lucide-react';
import ShipmentService  from '@/services/ShipmentService';
import { toast } from 'react-toastify';
import { ShipmentResponse, ShipmentStatus, UpdateShipmentStatusRequest } from '@/interfaces/data.interfaces';

interface ShipmentModalProps {
    orderId: number;
    isOpen: boolean;
    onClose: () => void;
    onShipmentCreated?: (shipment: ShipmentResponse) => void;
}

const ShipmentModal: React.FC<ShipmentModalProps> = ({ orderId, isOpen, onClose, onShipmentCreated }) => {
    const [shipment, setShipment] = useState<ShipmentResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [newStatus, setNewStatus] = useState<ShipmentStatus | ''>('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadShipment();
        }
    }, [isOpen, orderId]);

    const loadShipment = async () => {
        try {
            const data = await ShipmentService.getShipmentByOrderId(orderId);
            setShipment(data);
        } catch (error: unknown) {
            const err = error as { response?: { status: number } };
            if (err.response?.status === 404) {
                setShipment(null);
            } else {
                toast.error('Error loading shipment');
            }
        }
    };

    const handleCreateShipment = async () => {
        try {
            setLoading(true);
            const data = await ShipmentService.createShipment({ orderId, notes });
            setShipment(data);
            toast.success(`Shipment created! Tracking: ${data.trackingCode}`);
            if (onShipmentCreated) onShipmentCreated(data);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; status?: number } } };
            toast.error(err?.response?.data?.message || 'Error creating shipment');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!shipment || !newStatus) return;

        try {
            setLoading(true);
            const request: UpdateShipmentStatusRequest = {
                status: newStatus as ShipmentStatus,
                location,
                description
            };
            const updated = await ShipmentService.updateShipmentStatus(shipment.id, request);
            setShipment(updated);
            setNewStatus('');
            setLocation('');
            setDescription('');
            toast.success('Status updated successfully');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || 'Error updating status');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('es-AR');
    };

    if (!isOpen) return null;

    const availableStatuses = [
        ShipmentStatus.PROCESSING,
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERED,
        ShipmentStatus.FAILED_DELIVERY,
        ShipmentStatus.CANCELLED
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <Package className="w-8 h-8" />
                        <div>
                            <h2 className="text-2xl font-bold">
                                {shipment ? 'Shipment Details' : 'Create Shipment'}
                            </h2>
                            <p className="text-blue-100">Order #{orderId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-blue-700 p-2 rounded-lg transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {!shipment ? (
                        /* Create Shipment Form */
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-yellow-800">Create Shipment</h3>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Generate a tracking code and start the delivery process for this order.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Add any special instructions or notes..."
                                />
                            </div>

                            <button
                                onClick={handleCreateShipment}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                            >
                                <Package className="w-5 h-5" />
                                {loading ? 'Creating Shipment...' : 'Create Shipment'}
                            </button>
                        </div>
                    ) : (
                        /* Shipment Details */
                        <div className="space-y-6">
                            {/* Tracking Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">Tracking Information</h3>
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${ShipmentService.getStatusColor(shipment.status)}`}>
                                        {ShipmentService.translateStatus(shipment.status)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Tracking Code</p>
                                        <p className="font-mono font-bold text-xl text-blue-600">{shipment.trackingCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Carrier</p>
                                        <p className="font-semibold text-gray-800">{shipment.carrier}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Truck className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-semibold">Recipient</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">{shipment.recipientName}</p>
                                    <p className="text-sm text-gray-600">{shipment.recipientAddress}</p>
                                    <p className="text-sm text-gray-600">{shipment.recipientCity} - {shipment.recipientPostalCode}</p>
                                    <p className="text-sm text-gray-600">{shipment.recipientPhone}</p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-semibold">Dates</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">Created: {formatDate(shipment.createdAt)}</p>
                                    {shipment.shippedAt && <p className="text-sm text-gray-600">Shipped: {formatDate(shipment.shippedAt)}</p>}
                                    {shipment.estimatedDeliveryDate && <p className="text-sm text-gray-600">Est. Delivery: {formatDate(shipment.estimatedDeliveryDate)}</p>}
                                    {shipment.deliveredAt && <p className="text-sm text-green-600 font-semibold">Delivered: {formatDate(shipment.deliveredAt)}</p>}
                                </div>
                            </div>

                            {/* Update Status */}
                            {shipment.status !== ShipmentStatus.DELIVERED && shipment.status !== ShipmentStatus.CANCELLED && (
                                <div className="border-t pt-6">
                                    <h4 className="font-semibold mb-4">Update Status</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                                            className="p-2 border rounded-lg"
                                        >
                                            <option value="">Select new status...</option>
                                            {availableStatuses.map(status => (
                                                <option key={status} value={status}>
                                                    {ShipmentService.translateStatus(status)}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Location (e.g., Buenos Aires, AR)"
                                            className="p-2 border rounded-lg"
                                        />
                                    </div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description"
                                        className="w-full mt-4 p-2 border rounded-lg"
                                        rows={2}
                                    />
                                    <button
                                        onClick={handleUpdateStatus}
                                        disabled={loading || !newStatus}
                                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Update Status
                                    </button>
                                </div>
                            )}

                            {/* Tracking History */}
                            <div className="border-t pt-6">
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Tracking History
                                </h4>
                                <div className="space-y-3">
                                    {shipment.trackingHistory.map((entry, index) => (
                                        <div key={entry.id} className="flex gap-4 items-start">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                                {index < shipment.trackingHistory.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-300 mt-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${ShipmentService.getStatusColor(entry.status)}`}>
                                                        {ShipmentService.translateStatus(entry.status)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{entry.location}</p>
                                                <p className="text-sm text-gray-800">{entry.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShipmentModal;