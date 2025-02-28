/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { withAdmin } from '@/hoc/isAdmin';
import ReportService from '@/services/ReportService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import Line from '@/components/atoms/Line';
import { PaymentMethodReport, TopProductReport } from '@/interfaces/data.interfaces';
import { FileSpreadsheet, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportsPage = () => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodReport[]>([]);
  const [topProductsData, setTopProductsData] = useState<TopProductReport[]>([]);

  const paymentChartRef = React.useRef<HTMLDivElement>(null);
  const productsChartRef = React.useRef<HTMLDivElement>(null);

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

  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-lg font-medium">No data available for the selected period</p>
      <p className="text-sm mt-2">Try selecting a different date range</p>
    </div>
  );

  // Función para exportar a Excel
  const exportToExcel = () => {
    try {
      // Preparar datos de métodos de pago para Excel
      const paymentMethodSheet = paymentMethodData.map(item => ({
        'Payment Method': item.paymentMethod,
        'Order Count': item.orderCount,
        'Total Sales': formatCurrency(item.totalSales)
      }));

      // Preparar datos de productos para Excel
      const topProductsSheet = topProductsData.map(item => ({
        'Product Name': item.productName,
        'Quantity Sold': item.totalQuantity,
        'Total Sales': formatCurrency(item.totalSales)
      }));

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      
      // Agregar hojas
      const ws1 = XLSX.utils.json_to_sheet(paymentMethodSheet);
      const ws2 = XLSX.utils.json_to_sheet(topProductsSheet);
      
      XLSX.utils.book_append_sheet(wb, ws1, "Payment Methods");
      XLSX.utils.book_append_sheet(wb, ws2, "Top Products");

      // Generar archivo
      XLSX.writeFile(wb, `Sales_Report_${startDate}_${endDate}.xlsx`);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error generating Excel file');
    }
  };

  // Función para exportar a PDF
  const exportToPDF = async () => {
    try {
      // Crear nuevo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yOffset = 10;

      // Agregar título y fechas
      pdf.setFontSize(16);
      pdf.text('Sales Report', 105, yOffset, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Period: ${startDate} to ${endDate}`, 105, yOffset + 10, { align: 'center' });
      yOffset += 30;

      // Capturar y agregar gráfico de métodos de pago
      if (paymentChartRef.current) {
        const paymentCanvas = await html2canvas(paymentChartRef.current);
        const paymentImgData = paymentCanvas.toDataURL('image/png');
        pdf.text('Payment Methods Distribution', 105, yOffset, { align: 'center' });
        pdf.addImage(paymentImgData, 'PNG', 10, yOffset + 5, 190, 100);
        yOffset += 110;
      }

      // Agregar tabla de métodos de pago
      pdf.setFontSize(12);
      pdf.text('Payment Methods Summary', 105, yOffset, { align: 'center' });
      yOffset += 10;

      const paymentTableHeaders = [['Payment Method', 'Order Count', 'Total Sales']];
      const paymentTableData = paymentMethodData.map(item => [
        item.paymentMethod,
        item.orderCount.toString(),
        formatCurrency(item.totalSales)
      ]);

      autoTable(pdf, {
        startY: yOffset,
        head: paymentTableHeaders,
        body: paymentTableData,
        margin: { top: 10 },
      });
      yOffset = (pdf as any).lastAutoTable.finalY + 20;

      // Agregar nueva página para el gráfico de productos
      pdf.addPage();
      yOffset = 10;

      // Capturar y agregar gráfico de productos
      if (productsChartRef.current) {
        const productsCanvas = await html2canvas(productsChartRef.current);
        const productsImgData = productsCanvas.toDataURL('image/png');
        pdf.text('Top Selling Products', 105, yOffset, { align: 'center' });
        pdf.addImage(productsImgData, 'PNG', 10, yOffset + 5, 190, 100);
        yOffset += 110;
      }

      // Agregar tabla de productos
      const productTableHeaders = [['Product Name', 'Quantity Sold', 'Total Sales']];
      const productTableData = topProductsData.map(item => [
        item.productName,
        item.totalQuantity.toString(),
        formatCurrency(item.totalSales)
      ]);

      autoTable(pdf, {
        startY: yOffset,
        head: productTableHeaders,
        body: productTableData,
        margin: { top: 10 },
      });

      // Guardar PDF
      pdf.save(`Sales_Report_${startDate}_${endDate}.pdf`);
      toast.success('PDF file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Error generating PDF file');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Sales Reports</h1>

        <Line />
        
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex flex-wrap gap-4 items-center">
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

          {(paymentMethodData.length >= 0 || topProductsData.length >= 0) && (
            <div className="flex gap-2 mt-6">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet size={20} />
                Export Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                <FileDown size={20} />
                Export PDF
              </button>
            </div>
          )}
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
          <div className="flex flex-col items-center">
            {paymentMethodData.length > 0 ? (
              <>
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
              </>
            ) : (
              <NoDataMessage />
            )}
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
          {topProductsData.length > 0 ? (
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
          ) : (
          <NoDataMessage />
          )}
        </div>
      </div>
    </div>
  );
};

export default withAdmin(ReportsPage);