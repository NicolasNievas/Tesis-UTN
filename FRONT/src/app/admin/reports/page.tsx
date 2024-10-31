'use client';

import React, { useState } from 'react';
import { withAdmin } from '@/hoc/isAdmin';
import ReportService from '@/services/ReportService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import Line from '@/components/atoms/Line';
import { PaymentMethodReport, TopProductReport } from '@/interfaces/data.interfaces';

const ReportsPage = () => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodReport[]>([]);
  const [topProductsData, setTopProductsData] = useState<TopProductReport[]>([]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const paymentMethodNames: { [key: string]: string } = {
    'CREDIT_CARD': 'Credit Card',
    'DEBIT_CARD': 'Debit Card',
    'ACCOUNT_MONEY': 'Account Balance',
  };

  const handleStartDateChange = (newStartDate: string) => {
    if (newStartDate > endDate) {
      toast.error('Start date cannot be later than end date');
      return;
    }
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (newEndDate: string) => {
    if (newEndDate < startDate) {
      console.log('endDate', newEndDate);
      return;
    }
    setEndDate(newEndDate);
  };

  const fetchReports = async () => {
    try {
      if (startDate > endDate) {
        toast.error('Selected date range is not valid');
        return;
      }

      const paymentMethodResponse = await ReportService.getPaymentMethodReport(startDate, endDate);
      const topProductsResponse = await ReportService.getTopProductsReport(startDate, endDate);
      
      const transformedPaymentData = paymentMethodResponse.map(item => ({
        ...item,
        paymentMethod: paymentMethodNames[item.paymentMethod] || item.paymentMethod,
        totalSales: Number(item.totalSales)
      }));
      
      setPaymentMethodData(transformedPaymentData);
      setTopProductsData(topProductsResponse);
      
      toast.success('Reports generated successfully');
    } catch (error) {
      console.error('Error fetching reports', error);
      toast.error('Error generating reports');
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow border">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} className="text-sm">
              {pld.name === "Total Sales" 
                ? `${pld.name}: ${formatCurrency(pld.value)}`
                : `${pld.name}: ${pld.value} units`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.01) return null;

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${name} (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Sales Reports</h1>

        <Line />
        
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex flex-col">
            <label className="mb-2 font-medium">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              max={endDate} 
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              min={startDate} 
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={fetchReports}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors mt-6"
          >
            Generate Reports
          </button>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomizedLabel}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="totalSales"
                  nameKey="paymentMethod"
                  minAngle={2}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Summary Table */}
            <div className="w-full mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Sales
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentMethodData.map((method, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4  text-sm font-medium text-gray-900">
                        {method.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {method.orderCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(method.totalSales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={topProductsData}
              margin={{
                top: 20,
                right: 30,
                left: 50,
                bottom: 100
              }}
            >
              <XAxis
                dataKey="productName"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{fontSize: 12}}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#3b82f6"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="totalSales"
                fill="#3b82f6"
                name="Total Sales"
              />
              <Bar
                yAxisId="right"
                dataKey="totalQuantity"
                fill="#10b981"
                name="Quantity Sold"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default withAdmin(ReportsPage);