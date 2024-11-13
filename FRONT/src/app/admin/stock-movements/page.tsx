"use client"
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { StockMovementService, StockMovement } from '@/services/ReplenishmentService';
import { Alert } from '@/components/atoms/Alert';
import { withAdmin } from '@/hoc/isAdmin';

const StockMovementsPage = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    movementType: '',
    productId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFilters = { ...filters, [field]: value };
    
    // Validar rango de fechas
    if (field === 'startDate' && filters.endDate && new Date(value) > new Date(filters.endDate)) {
      setError('Start date cannot be later than end date');
      return;
    }
    
    if (field === 'endDate' && filters.startDate && new Date(value) < new Date(filters.startDate)) {
      setError('End date cannot be earlier than start date');
      return;
    }

    setError('');
    setFilters(newFilters);
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!validateDateRange(filters.startDate, filters.endDate)) {
        setError('Invalid date range');
        return;
      }

      const data = await StockMovementService.getMovements(filters);
      setMovements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Stock Movements</h1>
        
        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">Start Date</label>
            <input
              type="date"
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.startDate}
              max={filters.endDate || undefined}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">End Date</label>
            <input
              type="date"
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">Movement Type</label>
            <select
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.movementType}
              onChange={(e) => setFilters({ ...filters, movementType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchMovements}
              disabled={loading}
              className={`w-full p-2 rounded text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>

        {error && <Alert variant="destructive">{error}</Alert>}

        {/* Table Section */}
        <div className="overflow-x-auto border rounded">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No movements found. Apply filters to see results.
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {StockMovementService.formatDateForDisplay(movement.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">{movement.product.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        movement.movementType === 'INCOME' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.movementType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        movement.movementType === 'INCOME' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {movement.movementType === 'INCOME' ? '+' : '-'}{movement.quantity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default withAdmin(StockMovementsPage);