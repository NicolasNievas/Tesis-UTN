/* eslint-disable @next/next/no-img-element */
"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ArrowLeft, CreditCard, Calendar, User, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaymentResultPageProps {

    type: 'success' | 'failure' | 'pending';
  
  }

interface PaymentDetails {
  status: string;
  transaction_amount: number;
  payment_method_id: string;
  payment_type_id: string;
  date_created: string;
  external_reference: string;
  description: string;
  additional_info: {
    items: Array<{
      id: string;
      title: string;
      quantity: string;
      unit_price: string;
      picture_url?: string;
      description?: string;
    }>;
    payer: Array<{
        first_name: string;
        last_name: string;
    }>
  };
  payer: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    identification?: {
      type: string;
      number: string;
    };
  };
}

const PaymentResultPage: React.FC<PaymentResultPageProps> = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  const email = paymentDetails?.external_reference.split('|||')[1];
  const { first_name, last_name } = paymentDetails?.additional_info?.payer[0] || {};


  const payment_id = searchParams.get('payment_id') || 'N/A';
  const status = searchParams.get('status') || 'failure';

  const $TOKEN = process.env.NEXT_PUBLIC_MERCADO_PAGO_TOKEN;

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
          headers: {
            'Authorization': `Bearer ${$TOKEN}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener los detalles del pago');
        }

        const data = await response.json();
        setPaymentDetails(data);
      } catch (err) {
        console.error(err);
        setError('Error al obtener los detalles del pago');
      } finally {
        setLoading(false);
      }
    };

    if (payment_id !== 'N/A') {
      fetchPaymentDetails();
    }
  }, [payment_id]);

  const getStatusInfo = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: 'Thank you for your purchase!',
          message: 'Your order has been successfully processed.',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800'
        };
      case 'pending':
        return {
            icon: <Clock className="h-12 w-12 text-yellow-500" />,
            title: 'Pending payment',
            message: 'Your payment is being processed.',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-800'
          };
        
      default:
        return {
            icon: <XCircle className="h-12 w-12 text-red-500" />,
            title: 'Your payment could not be processed',
            message: 'There was a problem processing your payment. Please try again.',
            bgColor: 'bg-red-50',
            textColor: 'text-red-800'
          };
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  const generatePDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Configuración inicial del documento
    doc.setFont('helvetica');
    
    // Añadir encabezado
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('Purchase receipt', 105, 20, { align: 'center' });
    
    // Añadir estado del pago
    doc.setFontSize(16);
    const statusText = status === 'approved' ? 'APPROVED' : 
                      status === 'pending' ? 'PENDING' : 'FAILED';
    // Define el tipo explícito para el array de colores
    const statusColor: [number, number, number] = status === 'approved' ? [39, 174, 96] : 
                                                status === 'pending' ? [241, 196, 15] : [231, 76, 60];
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, 105, 30, { align: 'center' });
    
    // Información del comprador
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Buyer Information', 20, 45);
    doc.setFontSize(10);
    doc.text(`Name: ${first_name} ${last_name}`, 20, 55);
    doc.text(`Email: ${email}`, 20, 62);
    if (paymentDetails?.payer?.identification) {
      doc.text(`${paymentDetails.payer.identification.type}: ${paymentDetails.payer.identification.number}`, 20, 69);
    }

    // Información del pago
    doc.setFontSize(12);
    doc.text('Payment Details', 20, 85);
    doc.setFontSize(10);
    doc.text(`Payment Method: ${paymentDetails?.payment_type_id}`, 20, 95);
    doc.text(`Date: ${formatDate(paymentDetails?.date_created || '')}`, 20, 102);
    doc.text(`Transaction ID: ${payment_id}`, 20, 109);

    // Tabla de productos
    const headers = [['Product', 'Quantity', 'Unit Price', 'Subtotal']];
    const data = paymentDetails?.additional_info.items.map(item => [
      item.title,
      item.quantity,
      formatCurrency(Number(item.unit_price)),
      formatCurrency(Number(item.unit_price) * Number(item.quantity))
    ]) || [];

    autoTable(doc,{
      head: headers,
      body: data,
      startY: 120,
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 51] },
      styles: { fontSize: 9 },
      margin: { top: 20 }
    });

    // Total
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${formatCurrency(paymentDetails?.transaction_amount || 0)}`, 
      195, finalY, { align: 'right' });

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This document is a proof of purchase.', 105, 280, { align: 'center' });
    doc.text('© ' + new Date().getFullYear() + 'Coffee Craze.', 105, 285, { align: 'center' });

    // Guardar el PDF
    doc.save(`voucher-${payment_id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className={`text-center p-6 ${statusInfo.bgColor} rounded-lg mb-8`}>
          <div className="mx-auto flex justify-center mb-4">
            {statusInfo.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {statusInfo.title}
          </h1>
          <p className="text-lg text-gray-600">
            {statusInfo.message}
          </p>
        </div>

        {paymentDetails && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Purchase details</h2>
                <div className={`px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                  {status === 'approved' ? 'Approved' : 
                   status === 'pending' ? 'Pending' : 'Failed'}
                </div>
              </div>

              <div className="space-y-6">
                {paymentDetails.additional_info.items.map((item, index) => (
                  <div key={index} className="flex items-center p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <img 
                        src={item.picture_url || '/api/placeholder/80/80'} 
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × {formatCurrency(Number(item.unit_price))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(Number(item.unit_price) * Number(item.quantity))}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <p className="text-sm text-gray-500">Buyer&apos;s information</p>
                        </div>
                        <p className="font-medium">
                            {first_name} {last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {email}
                        </p>
                        {paymentDetails.payer.identification && (
                            <p className="text-sm text-gray-500">
                                {paymentDetails.payer.identification.type}: {paymentDetails.payer.identification.number}
                            </p>
                        )}
                    </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Payment Method</p>
                    </div>
                    <p className="font-medium">
                      {paymentDetails.payment_type_id}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Date of Purchase</p>
                    </div>
                    <p className="font-medium">
                      {formatDate(paymentDetails.date_created)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">Total</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(paymentDetails.transaction_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex space-x-4 justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-txt rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </button>
          
          <button
            onClick={generatePDF}
            className="txt-end flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-txt rounded-md hover:bg-gray-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Voucher
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;