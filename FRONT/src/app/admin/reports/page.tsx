'use client';

import React, { useState } from 'react';
import { TrendingUp, Users, Package, DollarSign, Calendar, FileSpreadsheet, FileDown, BarChart2, Clock, ShoppingCart, Star, Award, TrendingDown, AlertCircle, Target, Activity, TrendingUpIcon, PackageX, Layers, Tag, Truck } from 'lucide-react';
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
  InventoryReport, 
  OrderStatistics,
  OrdersByStatus,
  ConversionRate,
  SalesByBrand,
  ProductsWithoutMovement,
  ShippingMethodReport,
  SalesByCategory,
  TopProductByPeriod,
  MonthlyTrends} from '@/interfaces/data.interfaces';

type ReportCategory = 'sales' | 'customers' | 'inventory' | 'analytics' | 'performance';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

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
  // En el componente ReportsPage, agrega estos estados
  const [orderStatsData, setOrderStatsData] = useState<OrderStatistics | null>(null);
  const [ordersByStatusData, setOrdersByStatusData] = useState<OrdersByStatus[]>([]);
  const [conversionRateData, setConversionRateData] = useState<ConversionRate | null>(null);
  const [salesByBrandData, setSalesByBrandData] = useState<SalesByBrand[]>([]);
  const [salesByCategoryData, setSalesByCategoryData] = useState<SalesByCategory[]>([]);
  const [productsWithoutMovementData, setProductsWithoutMovementData] = useState<ProductsWithoutMovement[]>([]);
  const [shippingMethodData, setShippingMethodData] = useState<ShippingMethodReport[]>([]);
  // Parámetros adicionales
  const [period, setPeriod] = useState<string>('day');
  const [topCustomersLimit, setTopCustomersLimit] = useState<number>(10);
  const [minStock, setMinStock] = useState<number | ''>('');
  const [maxStock, setMaxStock] = useState<number | ''>('');
  const [includeZeroStock, setIncludeZeroStock] = useState<boolean>(false);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState<MonthlyTrends[]>([]);
  const [topProductPeriodData, setTopProductPeriodData] = useState<TopProductByPeriod | null>(null);
  const [inventoryDisplayLimit, setInventoryDisplayLimit] = useState<number>(15);
  const [showAllInventory, setShowAllInventory] = useState<boolean>(false);

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
    },
    {
      id: 'analytics' as ReportCategory,
      label: 'Business Analytics',
      icon: <BarChart2 className="w-5 h-5" />,
      description: 'Conversion rates, status distribution'
    },
    {
      id: 'performance' as ReportCategory,
      label: 'Performance Reports',
      icon: <Star className="w-5 h-5" />,
      description: 'Brands, categories & trends'
    }
  ];

  // Colores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
  //const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
        const [paymentMethods, topProducts, salesByPeriod, orderStats, shippingMethods, monthlyTrends, topProductPeriod] = await Promise.all([
          ReportService.getPaymentMethodReport(startDate, endDate),
          ReportService.getTopProductsReport(startDate, endDate),
          ReportService.getSalesByPeriodReport(period, startDate, endDate),
          ReportService.getOrderStatistics(startDate, endDate),
          ReportService.getShippingMethodReport(startDate, endDate),
          ReportService.getMonthlyTrendsReport(startDate, endDate),
          ReportService.getTopProductByPeriodReport(period, startDate, endDate)
        ]);
        setPaymentMethodData(paymentMethods);
        setTopProductsData(topProducts);
        setSalesByPeriodData(salesByPeriod);
        setOrderStatsData(orderStats);
        setShippingMethodData(shippingMethods || []);
        setMonthlyTrendsData(monthlyTrends || []);
        setTopProductPeriodData(topProductPeriod || null);
        break;

      case 'customers':
        const [customerStats, topCustomers ] = await Promise.all([
          ReportService.getCustomerStatistics(startDate, endDate),
          ReportService.getTopCustomers(topCustomersLimit),
        ]);
        setCustomerStatsData(customerStats);
        setTopCustomersData(topCustomers);
        // Guardar customerLocations en un estado si lo implementas
        break;

      case 'inventory':
        const [inventory, productsNoMovement] = await Promise.all([
          ReportService.getInventoryReport(startDate, endDate),
          ReportService.getProductsWithoutMovement(startDate),
          minStock || undefined, 
          maxStock || undefined, 
          includeZeroStock
        ]);
        setInventoryData(inventory);
        setProductsWithoutMovementData(productsNoMovement);
        break;

      case 'analytics':
        const [ordersByStatus, conversionRate] = await Promise.all([
          ReportService.getOrdersByStatus(startDate, endDate),
          ReportService.getConversionRate(startDate, endDate)
        ]);
        setOrdersByStatusData(ordersByStatus);
        setConversionRateData(conversionRate);
        break;

      case 'performance':
        const [salesByBrand, salesByCategory] = await Promise.all([
          ReportService.getSalesByBrand(startDate, endDate),
          ReportService.getSalesByCategory(startDate, endDate)
        ]);
        setSalesByBrandData(salesByBrand);
        setSalesByCategoryData(salesByCategory);
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

 const exportToExcel = (
  activeTab: string,
  startDate: string,
  endDate: string,
  data: any
) => {
  const wb = XLSX.utils.book_new();
  const filename = `${activeTab}_report_${startDate}_${endDate}.xlsx`;

  switch (activeTab) {
    case 'sales':
      exportSalesTabToExcel(wb, data);
      break;
    case 'customers':
      exportCustomersTabToExcel(wb, data);
      break;
    case 'inventory':
      exportInventoryTabToExcel(wb, data);
      break;
    case 'analytics':
      exportAnalyticsTabToExcel(wb, data);
      break;
    case 'performance':
      exportPerformanceTabToExcel(wb, data);
      break;
  }

  XLSX.writeFile(wb, filename);
  };

  // Exportar tab de ventas
  const exportSalesTabToExcel = (wb: XLSX.WorkBook, data: any) => {
    const {
      paymentMethodData = [],
      topProductsData = [],
      salesByPeriodData = [],
      orderStatsData = null,
      shippingMethodData = [],
      monthlyTrendsData = [],
      topProductPeriodData = null,
      period = 'day'
    } = data;

    // Hoja 1: Order Statistics
    if (orderStatsData) {
      const ws1 = XLSX.utils.json_to_sheet([
        { 'Metric': 'Total Orders', 'Value': orderStatsData.totalOrders },
        { 'Metric': 'Average Ticket', 'Value': formatCurrency(orderStatsData.averageTicket) },
        { 'Metric': 'Max Ticket', 'Value': formatCurrency(orderStatsData.maxTicket) },
        { 'Metric': 'Min Ticket', 'Value': formatCurrency(orderStatsData.minTicket) }
      ]);
      XLSX.utils.book_append_sheet(wb, ws1, 'Order Statistics');
    }

    // Hoja 2: Top Product by Period
    if (topProductPeriodData) {
      const ws2 = XLSX.utils.json_to_sheet([
        {
          'Period Type': period.charAt(0).toUpperCase() + period.slice(1),
          'Period': formatPeriod(topProductPeriodData.period, period),
          'Product Name': topProductPeriodData.productName,
          'Total Quantity': topProductPeriodData.totalQuantity,
          'Total Sales': formatCurrency(topProductPeriodData.totalSales)
        }
      ]);
      XLSX.utils.book_append_sheet(wb, ws2, 'Top Product by Period');
    }

    // Hoja 3: Monthly Trends
    if (monthlyTrendsData.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(
        monthlyTrendsData.map((item: any) => ({
          'Month': formatMonth(item.month),
          'Total Sales': formatCurrency(item.totalSales),
          'Order Count': item.orderCount,
          'Average Ticket': formatCurrency(item.averageTicket)
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws3, 'Monthly Trends');
    }

    // Hoja 4: Payment Methods
    if (paymentMethodData.length > 0) {
      const ws4 = XLSX.utils.json_to_sheet(
        paymentMethodData.map((item: any) => ({
          'Payment Method': item.paymentMethod,
          'Order Count': item.orderCount,
          'Total Sales': formatCurrency(item.totalSales)
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws4, 'Payment Methods');
    }

    // Hoja 5: Top Products
    if (topProductsData.length > 0) {
      const ws5 = XLSX.utils.json_to_sheet(
        topProductsData.map((item: any) => ({
          'Product': item.productName,
          'Quantity Sold': item.totalQuantity,
          'Total Sales': formatCurrency(item.totalSales)
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws5, 'Top Products');
    }

    // Hoja 6: Sales by Period
    if (salesByPeriodData.length > 0) {
      const ws6 = XLSX.utils.json_to_sheet(
        salesByPeriodData.map((item: any) => ({
          'Period': formatDate(item.period),
          'Orders': item.orderCount,
          'Total Sales': formatCurrency(item.totalSales)
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws6, 'Sales by Period');
    }

    // Hoja 7: Shipping Methods
    if (shippingMethodData.length > 0) {
      const ws7 = XLSX.utils.json_to_sheet(
        shippingMethodData.map((item: any) => ({
          'Shipping Method': item.shippingMethod,
          'Order Count': item.orderCount,
          'Total Sales': formatCurrency(item.totalSales),
          'Avg Shipping Cost': formatCurrency(item.averageShippingCost)
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws7, 'Shipping Methods');
    }
  };

  // Exportar tab de clientes
  const exportCustomersTabToExcel = (wb: XLSX.WorkBook, data: any) => {
    const { customerStatsData = [], topCustomersData = [] } = data;

    if (customerStatsData.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(
        customerStatsData.map((item: any) => ({
          'Customer': item.customerName,
          'Email': item.email,
          'Total Orders': item.totalOrders,
          'Total Spent': formatCurrency(item.totalSpent),
          'Avg Order Value': formatCurrency(item.averageOrderValue),
          'Last Purchase': formatDate(item.lastPurchaseDate)
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws1, 'Customer Statistics');
    }

    if (topCustomersData.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(
        topCustomersData.map((item: any) => ({
          'Customer': item.customerName,
          'Email': item.customerEmail,
          'Total Spent': formatCurrency(item.totalSpent),
          'Total Orders': item.totalOrders
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws2, 'Top Customers');
    }
  };

  // Exportar tab de inventario
  const exportInventoryTabToExcel = (wb: XLSX.WorkBook, data: any) => {
    const { inventoryData = [], productsWithoutMovementData = [] } = data;

    if (inventoryData.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(
        inventoryData.map((item: any) => ({
          'Product': item.productName,
          'Current Stock': item.currentStock,
          'Sold Quantity': item.totalSold,
          'Total Revenue': formatCurrency(item.totalRevenue),
          'Turnover Rate': formatPercentage(item.turnoverRate || 0),
          'Stock Status': item.currentStock === 0 ? 'Out of Stock' : 
                        item.currentStock < 10 ? 'Low Stock' : 'In Stock'
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws1, 'Inventory Report');
    }

    if (productsWithoutMovementData.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(
        productsWithoutMovementData.map((item: any) => ({
          'Product': item.productName,
          'Stock': item.stock,
          'Price': formatCurrency(item.price),
          'Inventory Value': formatCurrency(item.inventoryValue),
          'Last Movement': item.lastMovementDate || 'Never'
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws2, 'Products No Movement');
    }
  };

  // Exportar tab de analytics
  const exportAnalyticsTabToExcel = (wb: XLSX.WorkBook, data: any) => {
    const {
      orderStatsData = null,
      ordersByStatusData = [],
      conversionRateData = null
    } = data;

    if (orderStatsData) {
      const ws1 = XLSX.utils.json_to_sheet([
        { 'Metric': 'Total Orders', 'Value': orderStatsData.totalOrders },
        { 'Metric': 'Average Ticket', 'Value': formatCurrency(orderStatsData.averageTicket) },
        { 'Metric': 'Max Ticket', 'Value': formatCurrency(orderStatsData.maxTicket) },
        { 'Metric': 'Min Ticket', 'Value': formatCurrency(orderStatsData.minTicket) }
      ]);
      XLSX.utils.book_append_sheet(wb, ws1, 'Order Statistics');
    }

    if (ordersByStatusData.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(
        ordersByStatusData.map((item: any) => ({
          'Status': item.status,
          'Order Count': item.orderCount,
          'Total Amount': formatCurrency(item.totalAmount)
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws2, 'Orders by Status');
    }

    if (conversionRateData) {
      const ws3 = XLSX.utils.json_to_sheet([
        {
          'Metric': 'Completed Orders',
          'Value': conversionRateData.completed,
          'Rate': formatPercentage(conversionRateData.completionRate)
        },
        {
          'Metric': 'Cancelled Orders',
          'Value': conversionRateData.cancelled,
          'Rate': formatPercentage(conversionRateData.cancellationRate)
        },
        {
          'Metric': 'Pending Orders',
          'Value': conversionRateData.pending,
          'Rate': '-'
        },
        {
          'Metric': 'Total Orders',
          'Value': conversionRateData.total,
          'Rate': '100.00%'
        }
      ]);
      XLSX.utils.book_append_sheet(wb, ws3, 'Conversion Rate');
    }
  };

  // Exportar tab de performance
  const exportPerformanceTabToExcel = (wb: XLSX.WorkBook, data: any) => {
    const {
      salesByBrandData = [],
      salesByCategoryData = []
    } = data;

    if (salesByBrandData.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(
        salesByBrandData.map((item: any) => ({
          'Brand': item.brandName,
          'Items Sold': item.itemsSold,
          'Total Quantity': item.totalQuantity,
          'Total Sales': formatCurrency(item.totalSales)
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws1, 'Sales by Brand');
    }

    if (salesByCategoryData.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(
        salesByCategoryData.map((item: any) => ({
          'Category': item.categoryName,
          'Brand': item.brandName,
          'Items Sold': item.itemsSold,
          'Total Quantity': item.totalQuantity,
          'Total Sales': formatCurrency(item.totalSales)
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws2, 'Sales by Category');
    }
  };

  const exportToPDF = (
    activeTab: string,
    startDate: string,
    endDate: string,
    data: any,
    logoPath?: string
  ) => {
  const doc = new jsPDF() as JsPDFWithAutoTable;
  const filename = `${activeTab}_report_${startDate}_${endDate}.pdf`;

  let yStart = 15;
  if (logoPath) {
    try {
      doc.addImage(logoPath, 'PNG', 14, 10, 30, 15);
      yStart = 30;
    } catch (error) {
      console.log('Logo not found, continuing without it');
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`${activeTab.toUpperCase()} REPORT`, 105, yStart, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Period: ${startDate} to ${endDate}`, 105, yStart + 7, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleString('es-AR')}`, 105, yStart + 12, { align: 'center' });

  switch (activeTab) {
    case 'sales':
      exportSalesTabToPDF(doc, data, yStart + 20);
      break;
    case 'customers':
      exportCustomersTabToPDF(doc, data, yStart + 20);
      break;
    case 'inventory':
      exportInventoryTabToPDF(doc, data, yStart + 20);
      break;
    case 'analytics':
      exportAnalyticsTabToPDF(doc, data, yStart + 20);
      break;
    case 'performance':
      exportPerformanceTabToPDF(doc, data, yStart + 20);
      break;
  }

  doc.save(filename);
  };

  // Exportar tab de ventas a PDF 
  const exportSalesTabToPDF = (doc: JsPDFWithAutoTable, data: any, startY: number) => {
    const {
      paymentMethodData = [],
      topProductsData = [],
      salesByPeriodData = [],
      orderStatsData = null,
      shippingMethodData = [],
      monthlyTrendsData = [],
      topProductPeriodData = null,
      period = 'day'
    } = data;

    let yPos = startY;

    // Top Product by Period - NUEVO
    if (topProductPeriodData) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Top Product by ${period.charAt(0).toUpperCase() + period.slice(1)}`, 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Period', 'Product', 'Quantity', 'Total Sales']],
        body: [[
          formatPeriod(topProductPeriodData.period, period),
          topProductPeriodData.productName,
          topProductPeriodData.totalQuantity.toString(),
          formatCurrency(topProductPeriodData.totalSales)
        ]],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { top: 10 }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Monthly Trends - NUEVO
    if (monthlyTrendsData.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Trends', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Month', 'Orders', 'Total Sales', 'Avg. Ticket']],
        body: monthlyTrendsData.map((item: any) => [
          formatMonth(item.month),
          item.orderCount.toString(),
          formatCurrency(item.totalSales),
          formatCurrency(item.averageTicket)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 9 }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Order Statistics Summary
    if (orderStatsData) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Statistics Summary', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Total Orders', orderStatsData.totalOrders.toString()],
          ['Average Ticket', formatCurrency(orderStatsData.averageTicket)],
          ['Max Ticket', formatCurrency(orderStatsData.maxTicket)],
          ['Min Ticket', formatCurrency(orderStatsData.minTicket)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { top: 10 }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Payment Methods
    if (paymentMethodData.length > 0 && yPos < 250) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Methods', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Method', 'Orders', 'Total Sales']],
        body: paymentMethodData.map((item: any) => [
          item.paymentMethod,
          item.orderCount.toString(),
          formatCurrency(item.totalSales)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Top Products
    if (topProductsData.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Selling Products', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'Quantity', 'Total Sales']],
        body: topProductsData.slice(0, 15).map((item: any) => [
          item.productName,
          item.totalQuantity.toString(),
          formatCurrency(item.totalSales)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Shipping Methods
    if (shippingMethodData.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Shipping Methods', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Method', 'Orders', 'Total Sales', 'Avg Shipping Cost']],
        body: shippingMethodData.map((item: any) => [
          item.shippingMethod,
          item.orderCount.toString(),
          formatCurrency(item.totalSales),
          formatCurrency(item.averageShippingCost)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [6, 182, 212] }
      });
    }
  };

  // Exportar tab de clientes a PDF
  const exportCustomersTabToPDF = (doc: JsPDFWithAutoTable, data: any, startY: number) => {
    const { customerStatsData = [], topCustomersData = [] } = data;
    let yPos = startY;

    // Top Customers
    if (topCustomersData.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Customers', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Customer', 'Email', 'Total Spent', 'Orders']],
        body: topCustomersData.map((item: any) => [
          item.customerName,
          item.customerEmail,
          formatCurrency(item.totalSpent),
          item.totalOrders.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 8 }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Customer Statistics
    if (customerStatsData.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Statistics', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Customer', 'Email', 'Orders', 'Total Spent', 'Avg Order', 'Last Purchase']],
        body: customerStatsData.slice(0, 20).map((item: any) => [
          item.customerName,
          item.email,
          item.totalOrders.toString(),
          formatCurrency(item.totalSpent),
          formatCurrency(item.averageOrderValue),
          formatDate(item.lastPurchaseDate)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 7 }
      });
    }
  };

  // Exportar tab de inventario a PDF
  const exportInventoryTabToPDF = (doc: JsPDFWithAutoTable, data: any, startY: number) => {
    const { inventoryData = [], productsWithoutMovementData = [] } = data;
    let yPos = startY;

    if (inventoryData.length > 0) {
      const totalProducts = inventoryData.length;
      const totalRevenue = inventoryData.reduce((sum: number, item: any) => sum + item.totalRevenue, 0);
      const totalSold = inventoryData.reduce((sum: number, item: any) => sum + item.totalSold, 0);
      const outOfStock = inventoryData.filter((item: any) => item.currentStock === 0).length;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Inventory Summary', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Total Products', totalProducts.toString()],
          ['Total Revenue', formatCurrency(totalRevenue)],
          ['Total Sold', totalSold.toString()],
          ['Out of Stock', outOfStock.toString()]
        ],
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] }
      });
      yPos = doc.lastAutoTable.finalY + 10;

      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text('Inventory Details', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'Stock', 'Sold', 'Revenue', 'Turnover']],
        body: inventoryData.slice(0, 20).map((item: any) => [
          item.productName,
          item.currentStock.toString(),
          item.totalSold.toString(),
          formatCurrency(item.totalRevenue),
          formatPercentage(item.turnoverRate || 0)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] },
        styles: { fontSize: 9 }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (productsWithoutMovementData.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Products Without Movement', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'Stock', 'Price', 'Inventory Value']],
        body: productsWithoutMovementData.map((item: any) => [
          item.productName,
          item.stock.toString(),
          formatCurrency(item.price),
          formatCurrency(item.inventoryValue)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 9 }
      });
    }
  };

  // Exportar tab de analytics a PDF
  const exportAnalyticsTabToPDF = (doc: JsPDFWithAutoTable, data: any, startY: number) => {
    const {
      orderStatsData = null,
      ordersByStatusData = [],
      conversionRateData = null
    } = data;

    let yPos = startY;

    if (orderStatsData) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Statistics', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Total Orders', orderStatsData.totalOrders.toString()],
          ['Average Ticket', formatCurrency(orderStatsData.averageTicket)],
          ['Max Ticket', formatCurrency(orderStatsData.maxTicket)],
          ['Min Ticket', formatCurrency(orderStatsData.minTicket)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (ordersByStatusData.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Orders by Status', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Status', 'Order Count', 'Total Amount']],
        body: ordersByStatusData.map((item: any) => [
          item.status,
          item.orderCount.toString(),
          formatCurrency(item.totalAmount)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (conversionRateData) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Conversion Rate Analysis', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Count', 'Rate']],
        body: [
          ['Completed Orders', conversionRateData.completed.toString(), formatPercentage(conversionRateData.completionRate)],
          ['Cancelled Orders', conversionRateData.cancelled.toString(), formatPercentage(conversionRateData.cancellationRate)],
          ['Pending Orders', conversionRateData.pending.toString(), '-'],
          ['Total Orders', conversionRateData.total.toString(), '100.00%']
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });
    }
  };

  // Exportar tab de performance a PDF
  const exportPerformanceTabToPDF = (doc: JsPDFWithAutoTable, data: any, startY: number) => {
    const {
      salesByBrandData = [],
      salesByCategoryData = []
    } = data;

    let yPos = startY;

    if (salesByBrandData.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Sales by Brand', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Brand', 'Items Sold', 'Quantity', 'Total Sales']],
        body: salesByBrandData.map((item: any) => [
          item.brandName,
          item.itemsSold.toString(),
          item.totalQuantity.toString(),
          formatCurrency(item.totalSales)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (salesByCategoryData.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Sales by Category', 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Brand', 'Items', 'Quantity', 'Sales']],
        body: salesByCategoryData.map((item: any) => [
          item.categoryName,
          item.brandName,
          item.itemsSold.toString(),
          item.totalQuantity.toString(),
          formatCurrency(item.totalSales)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 8 }
      });
    }
  };

  // Función para calcular el turnover rate
  // const calculateTurnoverRate = (item: any) => {
  //   const sold = item.totalSold || 0;
  //   const stock = item.currentStock || 0;
  //   const total = sold + stock;
    
  //   if (total === 0) return 0;
  //   return (sold / total) * 100;
  // };

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
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <p className="font-semibold text-gray-900 mb-2">{label}</p>
            {payload.map((entry: TooltipPayload, index: number) => (
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
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name?: string }) => {
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

  // Función para formatear porcentaje
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Función para formatear fecha más detallada
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('en-US', { // es-AR para formato Arg
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener color según estado
const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'IN_PROCESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'DELIVERED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'RETURNED':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'REFUNDED':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

  // Agrega esta función en tu componente o utils
  const formatPeriod = (periodString: string, periodType: string): string => {
    if (!periodString) return 'N/A';
    
    try {
      const date = new Date(periodString);
      
      switch (periodType) {
        case 'day':
          return date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
          
        case 'week':
          const weekNumber = getWeekNumber(date);
          return `Week ${weekNumber} - ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
          
        case 'month':
          return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          });
          
        default:
          return date.toLocaleDateString('en-US');
      }
    } catch (error) {
      console.error('Error formateando período:', error);
      return periodString;
    }
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const formatMonth = (monthString: string): string => {
    if (!monthString) return 'N/A';
    
    if (monthString.includes('-')) {
      const [year, month] = monthString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
    return monthString;
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

              {/* FILTROS PARA INVENTARIO - AQUÍ VAN */}
              {activeTab === 'inventory' && (
                <>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <label className="text-sm text-gray-600">Stock Range:</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={maxStock}
                      onChange={(e) => setMaxStock(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeZeroStock"
                      checked={includeZeroStock}
                      onChange={(e) => setIncludeZeroStock(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="includeZeroStock" className="text-sm text-gray-600 whitespace-nowrap">
                      Include zero stock
                    </label>
                  </div>
                </>
              )}

              <div className="flex gap-2 ml-auto">
                {(paymentMethodData.length > 0 || topProductsData.length > 0 || salesByPeriodData.length > 0 || 
                  customerStatsData.length > 0 || topCustomersData.length > 0 || inventoryData.length > 0) && (
                  <>
                    <button
                      onClick={() => exportToExcel(activeTab, startDate, endDate, {
                        // Sales tab
                        paymentMethodData,
                        topProductsData,
                        salesByPeriodData,
                        orderStatsData,
                        shippingMethodData,
                        monthlyTrendsData,
                        topProductPeriodData,
                        period,

                        // Customers tab
                        customerStatsData,
                        topCustomersData,
                        
                        // Inventory tab
                        inventoryData,
                        productsWithoutMovementData,
                        
                        // Analytics tab
                        ordersByStatusData,
                        conversionRateData,
                        
                        // Performance tab
                        salesByBrandData,
                        salesByCategoryData
                      })}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </button>
                    <button
                      onClick={() => exportToPDF(activeTab, startDate, endDate, {
                        // Sales tab
                        paymentMethodData,
                        topProductsData,
                        salesByPeriodData,
                        orderStatsData,
                        shippingMethodData,
                        monthlyTrendsData,
                        topProductPeriodData,
                        period,
                        
                        // Customers tab
                        customerStatsData,
                        topCustomersData,
                        
                        // Inventory tab
                        inventoryData,
                        productsWithoutMovementData,
                        
                        // Analytics tab
                        ordersByStatusData,
                        conversionRateData,
                        
                        // Performance tab
                        salesByBrandData,
                        salesByCategoryData
                      }, '/logo2.png')} 
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
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Producto Top del Período */}
                {topProductPeriodData && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Award className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">Top {period}</p>
                          <p className="text-xs text-gray-500">{formatPeriod(topProductPeriodData.period, period)}</p>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {topProductPeriodData.productName}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Units</p>
                        <p className="text-lg font-semibold text-gray-900">{topProductPeriodData.totalQuantity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Sales</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(topProductPeriodData.totalSales)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Period</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {period.charAt(0).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly Trends KPI */}
                {monthlyTrendsData.length > 0 && monthlyTrendsData[0] && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">Month Performance</p>
                          <p className="text-xs text-gray-500">
                            {formatMonth(monthlyTrendsData[monthlyTrendsData.length - 1].month).split(' ')[0]}
                          </p>
                        </div>
                      </div>
                      {/* Growth indicator */}
                      {monthlyTrendsData.length > 1 && (() => {
                        const current = monthlyTrendsData[monthlyTrendsData.length - 1].totalSales;
                        const previous = monthlyTrendsData[monthlyTrendsData.length - 2].totalSales;
                        const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                        
                        return (
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(0)}%
                          </span>
                        );
                      })()}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Orders</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {monthlyTrendsData[monthlyTrendsData.length - 1].orderCount}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Sales</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {formatCurrency(monthlyTrendsData[monthlyTrendsData.length - 1].totalSales)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Avg. Ticket</p>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(monthlyTrendsData[monthlyTrendsData.length - 1].averageTicket)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Products Report */}
              {topProductsData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          yAxisId="left"
                          dataKey="totalSales" 
                          name="Total Sales" 
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          yAxisId="right"
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
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          dataKey="totalSales" 
                          name="Total Sales" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          yAxisId="right"
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
                            <td className="px-6 py-4 text-sm text-center font-medium text-gray-900">{formatDate(item.period)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.orderCount}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(item.totalSales)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Methods Report */}
              {paymentMethodData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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

              {/* Shipping Methods Report */}
              {shippingMethodData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Truck className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Shipping Methods</h2>
                      <p className="text-sm text-gray-600">Distribution of orders by shipping method</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico de Torta */}
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={shippingMethodData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="orderCount"
                            nameKey="shippingMethod"
                          >
                            {shippingMethodData.map((entry, index) => (
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipping Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Shipping Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {shippingMethodData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.shippingMethod}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{item.orderCount}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                {formatCurrency(item.totalSales)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                {formatCurrency(item.averageShippingCost)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethodData.length === 0 && topProductsData.length === 0 && 
              salesByPeriodData.length === 0 && shippingMethodData.length === 0 && 
              !topProductPeriodData && monthlyTrendsData.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-500 mb-2">No sales data available</p>
                  <p className="text-sm text-gray-400">Select a date range and click &quot;Generate Reports&quot;</p>
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
                        <YAxis yAxisId="left" orientation="left" stroke="#f59e0b" />
                        <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          yAxisId="left"
                          dataKey="totalSpent" 
                          name="Total Spent" 
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          yAxisId="right"
                          dataKey="totalOrders" 
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
                            <p className="text-xs text-gray-500">{customer.totalOrders} orders</p>
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
                            <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{customer.totalOrders}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(customer.totalSpent)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(customer.averageOrderValue)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(customer.lastPurchaseDate)}</td>
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
                  <p className="text-sm text-gray-400">Select a date range and click &quot;Generate Reports&quot;</p>
                </div>
              )}
            </>
          )}

          {/* Inventory Reports Tab */}
          {/* Inventory Reports Tab - IMPROVED VERSION */}
          {activeTab === 'inventory' && (
            <>
              {/* Inventory Summary */}
              {inventoryData.length > 0 && (
                
                <div className="bg-white rounded-lg shadow-sm p-6">

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
                        {inventoryData.reduce((sum, item) => sum + item.totalSold, 0)}
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

                  <div className="flex items-center justify-between mb-6 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Package className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Inventory Report</h2>
                        <p className="text-sm text-gray-600">Stock status and product performance</p>
                      </div>
                    </div>

                    {/* Control de límite de visualización */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">
                        Show products:
                      </label>
                      <select
                        value={inventoryDisplayLimit}
                        onChange={(e) => setInventoryDisplayLimit(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  {/* Gráfico de Rotación de Inventario */}
                  <div className="h-96 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={inventoryData.slice(0, inventoryDisplayLimit)}
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
                          dataKey="totalSold" 
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

                  {/* Indicador de productos restantes */}
                  {inventoryData.length > inventoryDisplayLimit && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
                      <p className="text-sm text-blue-700">
                        Showing {inventoryDisplayLimit} of {inventoryData.length} products. 
                        <span className="font-medium"> {inventoryData.length - inventoryDisplayLimit} more products available.</span>
                      </p>
                    </div>
                  )}

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
                        {inventoryData.slice(0, showAllInventory ? inventoryData.length : inventoryDisplayLimit).map((item) => (
                          <tr key={item.productId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.productName}</td>
                            <td className={`px-6 py-4 text-sm ${getStockColor(item.currentStock)}`}>
                              {item.currentStock}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.totalSold}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                              {formatCurrency(item.totalRevenue)}
                            </td>
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

                    {/* Botón para mostrar más/menos */}
                    {inventoryData.length > inventoryDisplayLimit && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => setShowAllInventory(!showAllInventory)}
                          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                        >
                          {showAllInventory ? (
                            <>
                              <TrendingDown className="w-4 h-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-4 h-4" />
                              Show All ({inventoryData.length} products)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  
                </div>
              )}

              {/* Products Without Movement - También con límite */}
              {productsWithoutMovementData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <PackageX className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Products Without Movement</h2>
                      <p className="text-sm text-gray-600">
                        Products that haven&apos;t been sold recently ({productsWithoutMovementData.length} total)
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inventory Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Movement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {productsWithoutMovementData.slice(0, inventoryDisplayLimit).map((product) => (
                          <tr key={product.productId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.productName}</td>
                            <td className={`px-6 py-4 text-sm ${getStockColor(product.stock)}`}>
                              {product.stock}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatCurrency(product.price)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                              {formatCurrency(product.inventoryValue)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {product.lastMovementDate ? formatDateTime(product.lastMovementDate) : 'Never'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {productsWithoutMovementData.length > inventoryDisplayLimit && (
                      <div className="bg-gray-50 border-t border-gray-200 p-3 text-center">
                        <p className="text-sm text-gray-600">
                          Showing {inventoryDisplayLimit} of {productsWithoutMovementData.length} products without movement
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {inventoryData.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-500 mb-2">No inventory data available</p>
                  <p className="text-sm text-gray-400">Select a date range and click &quot;Generate Reports&quot;</p>
                </div>
              )}
            </>
          )}

          {/* Analytics Reports Tab */}
        {/* Analytics Reports Tab - IMPROVED VERSION */}
        {activeTab === 'analytics' && (
          <>
            {/* Order Statistics Summary */}
            {orderStatsData && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BarChart2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Order Statistics</h2>
                    <p className="text-sm text-gray-600">Key metrics and performance indicators</p>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Total Orders</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {orderStatsData.totalOrders}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Average Ticket</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {formatCurrency(orderStatsData.averageTicket)}
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Max Ticket</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">
                      {formatCurrency(orderStatsData.maxTicket)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Min Ticket</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mt-2">
                      {formatCurrency(orderStatsData.minTicket)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Orders by Status Report */}
            {ordersByStatusData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Orders by Status</h2>
                    <p className="text-sm text-gray-600">Distribution of orders across different statuses</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Torta */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ordersByStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="orderCount"
                          nameKey="status"
                        >
                          {ordersByStatusData.map((entry, index) => (
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Count</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {ordersByStatusData.map((item, index) => {
                          const totalOrders = ordersByStatusData.reduce((sum, i) => sum + i.orderCount, 0);
                          const percentage = totalOrders > 0 ? (item.orderCount / totalOrders) * 100 : 0;
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{item.orderCount}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                {formatCurrency(item.totalAmount)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                    <div 
                                      className="bg-purple-600 h-2 rounded-full" 
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

            {/* Conversion Rate Report */}
            {ordersByStatusData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Order Flow Analysis</h2>
                    <p className="text-sm text-gray-600">Complete journey tracking from order creation to completion</p>
                  </div>
                </div>

                {/* Métricas clave calculadas desde ordersByStatusData */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {(() => {
                    const totalOrders = ordersByStatusData.reduce((sum, item) => sum + item.orderCount, 0);
                    const completed = ordersByStatusData.find(s => s.status === 'DELIVERED')?.orderCount || 0;
                    const cancelled = ordersByStatusData.find(s => s.status === 'CANCELLED')?.orderCount || 0;
                    const pending = ordersByStatusData.find(s => s.status === 'PENDING')?.orderCount || 0;
                    const inProcess = ordersByStatusData.find(s => s.status === 'PROCESSING')?.orderCount || 0;

                    const completionRate = totalOrders > 0 ? (completed / totalOrders) * 100 : 0;
                    const cancellationRate = totalOrders > 0 ? (cancelled / totalOrders) * 100 : 0;
                    const processingRate = totalOrders > 0 ? (inProcess / totalOrders) * 100 : 0;
                    const pendingRate = totalOrders > 0 ? (pending / totalOrders) * 100 : 0;

                    return (
                      <>
                        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Target className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-900">Delivered</span>
                            </div>
                            <span className="text-2xl font-bold text-green-600">
                              {completionRate.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-sm text-green-700">
                            {completed} orders successfully completed
                          </p>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Activity className="w-5 h-5 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">In Process</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">
                              {processingRate.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">
                            {inProcess} orders currently being processed
                          </p>
                        </div>

                        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-900">Pending</span>
                            </div>
                            <span className="text-2xl font-bold text-yellow-600">
                              {pendingRate.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-sm text-yellow-700">
                            {pending} orders awaiting processing
                          </p>
                        </div>

                        <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <span className="text-sm font-medium text-red-900">Cancelled</span>
                            </div>
                            <span className="text-2xl font-bold text-red-600">
                              {cancellationRate.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-sm text-red-700">
                            {cancelled} orders cancelled
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Gráfico de flujo de pedidos */}
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ordersByStatusData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="orderCount" 
                        name="Order Count"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="totalAmount" 
                        name="Total Amount"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                
              </div>
            )}

            {!orderStatsData && ordersByStatusData.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <BarChart2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-500 mb-2">No analytics data available</p>
                <p className="text-sm text-gray-400">Select a date range and click &quot;Generate Reports&quot;</p>
              </div>
            )}
          </>
        )}

        {/* Performance Reports Tab */}
        {activeTab === 'performance' && (
          <>
            {/* Sales by Brand Report */}
            {salesByBrandData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Tag className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Sales by Brand</h2>
                    <p className="text-sm text-gray-600">Performance analysis by product brand</p>
                  </div>
                </div>

                <div className="h-96 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesByBrandData.slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="brandName" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#f97316" />
                    <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="totalSales" 
                      name="Total Sales" 
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="totalQuantity" 
                      name="Quantity Sold" 
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items Sold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salesByBrandData.map((brand, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.brandName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{brand.itemsSold}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{brand.totalQuantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {formatCurrency(brand.totalSales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sales by Category Report */}
            {salesByCategoryData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Layers className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Sales by Category</h2>
                    <p className="text-sm text-gray-600">Performance analysis by product category</p>
                  </div>
                </div>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items Sold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salesByCategoryData.map((category, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {category.categoryName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{category.brandName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{category.itemsSold}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{category.totalQuantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {formatCurrency(category.totalSales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Gráfico de categorías */}
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={salesByCategoryData.slice(0, 15)}
      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="categoryName" 
        angle={-45}
        textAnchor="end"
        height={60}
        interval={0}
        fontSize={12}
      />
      {/* CAMBIO: Agregar dos ejes Y separados */}
      <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
      <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      {/* CAMBIO: Usar yAxisId diferentes para cada barra */}
      <Bar 
        yAxisId="left"
        dataKey="totalSales" 
        name="Total Sales" 
        fill="#8b5cf6"
        radius={[4, 4, 0, 0]}
      />
      <Bar 
        yAxisId="right"
        dataKey="totalQuantity" 
        name="Quantity Sold" 
        fill="#06b6d4"
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
                </div>
              </div>
            )}

            {salesByBrandData.length === 0 && salesByCategoryData.length === 0 && productsWithoutMovementData.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-500 mb-2">No performance data available</p>
                <p className="text-sm text-gray-400">Select a date range and click &quot;Generate Reports&quot;</p>
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