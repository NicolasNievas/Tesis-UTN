'use client';

import React, { useState } from 'react';
import { TrendingUp, Users, Package, DollarSign, Calendar, FileSpreadsheet, FileDown, BarChart2, Clock, ShoppingCart, Star, Award, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import ReportService, {

} from '@/services/ReportService';
import { withAdmin } from '@/hoc/isAdmin';
//import Line from '@/components/atoms/Line';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import {   PaymentMethodReport,
  TopProductReport,
  SalesByPeriodReport,
  CustomerStatistics,
  TopCustomer,
  InventoryReport } from '@/interfaces/data.interfaces';

type ReportCategory = 'sales' | 'customers' | 'inventory';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<ReportCategory>('sales');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Estados para cada tipo de reporte
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodReport[]>([]);
  const [topProductsData, setTopProductsData] = useState<TopProductReport[]>([]);
  const [salesByPeriodData, setSalesByPeriodData] = useState<SalesByPeriodReport[]>([]);
  const [customerStatsData, setCustomerStatsData] = useState<CustomerStatistics[]>([]);
  const [topCustomersData, setTopCustomersData] = useState<TopCustomer[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryReport[]>([]);

  // Parámetros adicionales
  const [period, setPeriod] = useState<string>('day');
  const [topCustomersLimit, setTopCustomersLimit] = useState<number>(10);

  const tabs = [
    {
      id: 'sales' as ReportCategory,
      label: 'Sales Reports',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Payment methods, products & trends'
    },
    {
      id: 'customers' as ReportCategory,
      label: 'Customer Reports',
      icon: <Users className="w-5 h-5" />,
      description: 'Statistics and top customers'
    },
    {
      id: 'inventory' as ReportCategory,
      label: 'Inventory Reports',
      icon: <Package className="w-5 h-5" />,
      description: 'Stock status and movements'
    }
  ];

  // Colores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
  const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const handleGenerateReports = async () => {
    if (startDate > endDate) {
      toast.error('Start date cannot be later than end date');
      return;
    }

    setLoading(true);
    try {
      switch (activeTab) {
        case 'sales':
          const [paymentMethods, topProducts, salesByPeriod] = await Promise.all([
            ReportService.getPaymentMethodReport(startDate, endDate),
            ReportService.getTopProductsReport(startDate, endDate),
            ReportService.getSalesByPeriodReport(period, startDate, endDate)
          ]);
          setPaymentMethodData(paymentMethods);
          setTopProductsData(topProducts);
          setSalesByPeriodData(salesByPeriod);
          break;

        case 'customers':
          const [customerStats, topCustomers] = await Promise.all([
            ReportService.getCustomerStatistics(startDate, endDate),
            ReportService.getTopCustomers(topCustomersLimit)
          ]);
          setCustomerStatsData(customerStats);
          setTopCustomersData(topCustomers);
          break;

        case 'inventory':
          const inventory = await ReportService.getInventoryReport(startDate, endDate);
          setInventoryData(inventory);
          break;
      }
      toast.success('Reports generated successfully');
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('Error generating reports');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    switch (activeTab) {
      case 'sales':
        if (paymentMethodData.length > 0) {
          const ws1 = XLSX.utils.json_to_sheet(paymentMethodData.map(item => ({
            'Payment Method': item.paymentMethod,
            'Order Count': item.orderCount,
            'Total Sales': formatCurrency(item.totalSales)
          })));
          XLSX.utils.book_append_sheet(wb, ws1, "Payment Methods");
        }
        if (topProductsData.length > 0) {
          const ws2 = XLSX.utils.json_to_sheet(topProductsData.map(item => ({
            'Product': item.productName,
            'Quantity': item.totalQuantity,
            'Total Sales': formatCurrency(item.totalSales)
          })));
          XLSX.utils.book_append_sheet(wb, ws2, "Top Products");
        }
        if (salesByPeriodData.length > 0) {
          const ws3 = XLSX.utils.json_to_sheet(salesByPeriodData.map(item => ({
            'Period': item.period,
            'Orders': item.orderCount,
            'Total Sales': formatCurrency(item.totalSales)
          })));
          XLSX.utils.book_append_sheet(wb, ws3, "Sales by Period");
        }
        break;

      case 'customers':
        if (customerStatsData.length > 0) {
          const ws1 = XLSX.utils.json_to_sheet(customerStatsData.map(item => ({
            'Customer': item.customerName,
            'Email': item.customerEmail,
            'Orders': item.totalOrders,
            'Total Spent': formatCurrency(item.totalSpent),
            'Avg Order': formatCurrency(item.averageOrderValue),
            'Last Order': formatDate(item.lastOrderDate)
          })));
          XLSX.utils.book_append_sheet(wb, ws1, "Customer Statistics");
        }
        if (topCustomersData.length > 0) {
          const ws2 = XLSX.utils.json_to_sheet(topCustomersData.map(item => ({
            'Customer': item.customerName,
            'Email': item.customerEmail,
            'Total Spent': formatCurrency(item.totalSpent),
            'Orders': item.orderCount
          })));
          XLSX.utils.book_append_sheet(wb, ws2, "Top Customers");
        }
        break;

      case 'inventory':
        if (inventoryData.length > 0) {
          const ws = XLSX.utils.json_to_sheet(inventoryData.map(item => ({
            'Product': item.productName,
            'Current Stock': item.currentStock,
            'Sold': item.soldQuantity,
            'Revenue': formatCurrency(item.totalRevenue),
            'Turnover Rate': `${(item.turnoverRate || 0).toFixed(1)}%`
          })));
          XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        }
        break;
    }

    XLSX.writeFile(wb, `${activeTab}_report_${startDate}_${endDate}.xlsx`);
    toast.success('Excel file downloaded successfully');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(18);
    doc.text(`${activeTab.toUpperCase()} REPORT`, 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Period: ${startDate} to ${endDate}`, 105, 22, { align: 'center' });

    let yPos = 30;

    switch (activeTab) {
      case 'sales':
        if (paymentMethodData.length > 0) {
          doc.setFontSize(12);
          doc.text('Payment Methods', 14, yPos);
          yPos += 5;
          autoTable(doc, {
            startY: yPos,
            head: [['Method', 'Orders', 'Total Sales']],
            body: paymentMethodData.map(item => [
              item.paymentMethod,
              item.orderCount.toString(),
              formatCurrency(item.totalSales)
            ]),
            margin: { top: 10 }
          });
          yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        if (topProductsData.length > 0 && yPos < 270) {
          doc.setFontSize(12);
          doc.text('Top Products', 14, yPos);
          yPos += 5;
          autoTable(doc, {
            startY: yPos,
            head: [['Product', 'Quantity', 'Total Sales']],
            body: topProductsData.map(item => [
              item.productName,
              item.totalQuantity.toString(),
              formatCurrency(item.totalSales)
            ])
          });
        }
        break;

      case 'customers':
        if (topCustomersData.length > 0) {
          doc.setFontSize(12);
          doc.text('Top Customers', 14, yPos);
          yPos += 5;
          autoTable(doc, {
            startY: yPos,
            head: [['Customer', 'Email', 'Total Spent', 'Orders']],
            body: topCustomersData.map(item => [
              item.customerName,
              item.customerEmail,
              formatCurrency(item.totalSpent),
              item.orderCount.toString()
            ])
          });
        }
        break;

      case 'inventory':
        if (inventoryData.length > 0) {
          doc.setFontSize(12);
          doc.text('Inventory Status', 14, yPos);
          yPos += 5;
          autoTable(doc, {
            startY: yPos,
            head: [['Product', 'Stock', 'Sold', 'Revenue']],
            body: inventoryData.map(item => [
              item.productName,
              item.currentStock.toString(),
              item.soldQuantity.toString(),
              formatCurrency(item.totalRevenue)
            ])
          });
        }
        break;
    }

    doc.save(`${activeTab}_report_${startDate}_${endDate}.pdf`);
    toast.success('PDF file downloaded successfully');
  };

  // Función para determinar el color del indicador de rotación
  const getTurnoverColor = (rate: number) => {
    if (rate > 50) return 'text-green-600';
    if (rate > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Función para determinar el color del stock
  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 font-semibold';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Custom Tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Sales') || entry.name.includes('Spent') || entry.name.includes('Revenue') 
                ? formatCurrency(entry.value)
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render label para gráfico de torta
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports Dashboard</h1>
          <p className="text-gray-600">Analyze your business performance across different metrics</p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    transition-all duration-200
                  `}
                >
                  <span className={`mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {tab.icon}
                  </span>
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-400 font-normal">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Date Filters */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">From:</label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">To:</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Additional filters based on active tab */}
              {activeTab === 'sales' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Period:</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Top:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={topCustomersLimit}
                    onChange={(e) => setTopCustomersLimit(parseInt(e.target.value) || 10)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">customers</span>
                </div>
              )}

              <div className="flex gap-2 ml-auto">
                {(paymentMethodData.length > 0 || topProductsData.length > 0 || salesByPeriodData.length > 0 || 
                  customerStatsData.length > 0 || topCustomersData.length > 0 || inventoryData.length > 0) && (
                  <>
                    <button
                      onClick={exportToExcel}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <FileDown className="w-4 h-4" />
                      Export PDF
                    </button>
                  </>
                )}

                <button
                  onClick={handleGenerateReports}
                  disabled={loading}
                  className="px-6 py-2 bg-black-btn text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Reports'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Sales Reports Tab */}
          {activeTab === 'sales' && (
            <>
              {/* Payment Methods Report */}
              {paymentMethodData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
                      <p className="text-sm text-gray-600">Distribution of sales by payment method</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico de Torta */}
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentMethodData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="totalSales"
                            nameKey="paymentMethod"
                          >
                            {paymentMethodData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Tabla de Datos */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paymentMethodData.map((item, index) => {
                            const totalSales = paymentMethodData.reduce((sum, i) => sum + i.totalSales, 0);
                            const percentage = (item.totalSales / totalSales) * 100;
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.paymentMethod}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{item.orderCount}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(item.totalSales)}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Products Report */}
              {topProductsData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Top Selling Products</h2>
                      <p className="text-sm text-gray-600">Best performing products by sales</p>
                    </div>
                  </div>

                  <div className="h-96 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topProductsData.slice(0, 10)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="productName" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={0}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="totalSales" 
                          name="Total Sales" 
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="totalQuantity" 
                          name="Quantity Sold" 
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {topProductsData.map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.productName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.totalQuantity}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(product.totalSales)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sales by Period Report */}
              {salesByPeriodData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Sales by {period.charAt(0).toUpperCase() + period.slice(1)}</h2>
                      <p className="text-sm text-gray-600">Sales trends over time</p>
                    </div>
                  </div>

                  <div className="h-96 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salesByPeriodData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="period"
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          //type="monotone" 
                          dataKey="totalSales" 
                          name="Total Sales" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="orderCount" 
                          name="Order Count" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salesByPeriodData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.period}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.orderCount}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(item.totalSales)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {paymentMethodData.length === 0 && topProductsData.length === 0 && salesByPeriodData.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-500 mb-2">No sales data available</p>
                  <p className="text-sm text-gray-400">Select a date range and click "Generate Reports"</p>
                </div>
              )}
            </>
          )}

          {/* Customer Reports Tab */}
          {activeTab === 'customers' && (
            <>
              {/* Top Customers Report */}
              {topCustomersData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Top {topCustomersLimit} Customers</h2>
                      <p className="text-sm text-gray-600">Best customers by total spending</p>
                    </div>
                  </div>

                  <div className="h-96 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topCustomersData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="customerName" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={0}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="totalSpent" 
                          name="Total Spent" 
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="orderCount" 
                          name="Order Count" 
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    {topCustomersData.map((customer, index) => (
                      <div key={customer.customerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.customerName}</p>
                            <p className="text-sm text-gray-600">{customer.customerEmail}</p>
                            <p className="text-xs text-gray-500">{customer.orderCount} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                          <p className="text-sm text-gray-600">Total spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Statistics */}
              {customerStatsData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Customer Statistics</h2>
                      <p className="text-sm text-gray-600">Detailed customer behavior analysis</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Order</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {customerStatsData.map((customer) => (
                          <tr key={customer.customerId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.customerName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{customer.customerEmail}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{customer.totalOrders}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(customer.totalSpent)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(customer.averageOrderValue)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(customer.lastOrderDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {topCustomersData.length === 0 && customerStatsData.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-500 mb-2">No customer data available</p>
                  <p className="text-sm text-gray-400">Select a date range and click "Generate Reports"</p>
                </div>
              )}
            </>
          )}

          {/* Inventory Reports Tab */}
          {activeTab === 'inventory' && (
            <>
              {/* Inventory Summary */}
              {inventoryData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Inventory Report</h2>
                      <p className="text-sm text-gray-600">Stock status and product performance</p>
                    </div>
                  </div>

                  {/* Gráfico de Rotación de Inventario */}
                  <div className="h-96 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={inventoryData.slice(0, 15)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="productName" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={0}
                          fontSize={12}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          yAxisId="left"
                          dataKey="soldQuantity" 
                          name="Sold Quantity" 
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          yAxisId="right"
                          dataKey="currentStock" 
                          name="Current Stock" 
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turnover Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventoryData.map((item) => (
                          <tr key={item.productId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.productName}</td>
                            <td className={`px-6 py-4 text-sm ${getStockColor(item.currentStock)}`}>
                              {item.currentStock}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.soldQuantity}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(item.totalRevenue)}</td>
                            <td className={`px-6 py-4 text-sm font-semibold ${getTurnoverColor(item.turnoverRate || 0)}`}>
                              {(item.turnoverRate || 0).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4">
                              {item.currentStock === 0 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Out of Stock
                                </span>
                              ) : item.currentStock < 10 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  In Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Total Products</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 mt-2">{inventoryData.length}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Total Revenue</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        {formatCurrency(inventoryData.reduce((sum, item) => sum + item.totalRevenue, 0))}
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">Total Sold</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600 mt-2">
                        {inventoryData.reduce((sum, item) => sum + item.soldQuantity, 0)}
                      </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-900">Out of Stock</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600 mt-2">
                        {inventoryData.filter(item => item.currentStock === 0).length}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {inventoryData.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-500 mb-2">No inventory data available</p>
                  <p className="text-sm text-gray-400">Select a date range and click "Generate Reports"</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAdmin(ReportsPage);