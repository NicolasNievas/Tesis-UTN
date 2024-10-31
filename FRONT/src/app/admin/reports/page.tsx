'use client';
import React, { useState } from 'react';
import ReportService from '@/services/ReportService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { withAdmin } from '@/hoc/isAdmin';

interface PaymentMethodReport {
  paymentMethod: string;
  orderCount: number;
  totalSales: number;
}

interface TopProductReport {
  productName: string;
  totalQuantity: number;
  totalSales: number;
}

const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodReport[]>([]);
  const [topProductsData, setTopProductsData] = useState<TopProductReport[]>([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const fetchReports = async () => {
    try {
      const paymentMethodData = await ReportService.getPaymentMethodReport(startDate, endDate);
      const topProductsData = await ReportService.getTopProductsReport(startDate, endDate);

      setPaymentMethodData(paymentMethodData);
      setTopProductsData(topProductsData);
    } catch (error) {
      console.error('Error fetching reports', error);
    }
  };

  return (
    <div>
      <div>
        <label>Fecha Inicio: 
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </label>
        <label>Fecha Fin: 
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </label>
        <button onClick={fetchReports}>Generar Reportes</button>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Gráfico de Torta - Métodos de Pago */}
        <PieChart width={400} height={400}>
          <Pie
            data={paymentMethodData}
            cx={200}
            cy={200}
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="totalSales"
          >
            {paymentMethodData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>

        {/* Gráfico de Barras - Productos Más Vendidos */}
        <BarChart width={500} height={300} data={topProductsData}>
          <XAxis dataKey="productName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalQuantity" fill="#8884d8" name="Cantidad Vendida" />
        </BarChart>
      </div>
    </div>
  );
};

export default withAdmin(ReportsPage);