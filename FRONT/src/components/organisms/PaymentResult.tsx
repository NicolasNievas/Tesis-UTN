"use client"
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentDetailsContent } from './PaymentDetailsContent';

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
      quantity: number;
      unit_price: number;
      picture_url: string;
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

  const payment_id = searchParams?.get('payment_id') || 'N/A';
  const status = searchParams?.get('status') || 'failure';

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

  const generatePDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFont('helvetica');
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('Purchase receipt', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    const statusText = status === 'approved' ? 'APPROVED' : 
                      status === 'pending' ? 'PENDING' : 'FAILED';
    const statusColor = status === 'approved' ? [39, 174, 96] : 
                       status === 'pending' ? [241, 196, 15] : [231, 76, 60];
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, 105, 30, { align: 'center' });
    
    const email = paymentDetails?.external_reference?.split('|||')[1] || '';
    const { first_name = '', last_name = '' } = paymentDetails?.additional_info?.payer[0] || {};

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Buyer Information', 20, 45);
    doc.setFontSize(10);
    doc.text(`Name: ${first_name} ${last_name}`, 20, 55);
    doc.text(`Email: ${email}`, 20, 62);
    if (paymentDetails?.payer?.identification) {
      doc.text(`${paymentDetails.payer.identification.type}: ${paymentDetails.payer.identification.number}`, 20, 69);
    }

    doc.setFontSize(12);
    doc.text('Payment Details', 20, 85);
    doc.setFontSize(10);
    doc.text(`Payment Method: ${paymentDetails?.payment_type_id}`, 20, 95);
    doc.text(`Date: ${formatDate(paymentDetails?.date_created || '')}`, 20, 102);
    doc.text(`Transaction ID: ${payment_id}`, 20, 109);

    const headers = [['Product', 'Quantity', 'Unit Price', 'Subtotal']];
    const data = paymentDetails?.additional_info.items.map(item => [
      item.title,
      item.quantity,
      formatCurrency(Number(item.unit_price)),
      formatCurrency(Number(item.unit_price) * Number(item.quantity))
    ]) || [];

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 120,
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 51] },
      styles: { fontSize: 9 },
      margin: { top: 20 }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${formatCurrency(paymentDetails?.transaction_amount || 0)}`, 
      195, finalY, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This document is a proof of purchase.', 105, 280, { align: 'center' });
    doc.text('© ' + new Date().getFullYear() + ' Coffee Craze.', 105, 285, { align: 'center' });

    doc.save(`voucher-${payment_id}.pdf`);
  };

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (payment_id === 'N/A') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MERCADO_PAGO_TOKEN}`
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

    fetchPaymentDetails();
  }, [payment_id]);

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
  const email = paymentDetails?.external_reference?.split('|||')[1] || '';
  const { first_name = '', last_name = '' } = paymentDetails?.additional_info?.payer[0] || {};

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {paymentDetails && (
        <PaymentDetailsContent 
          paymentDetails={paymentDetails}
          status={status}
          statusInfo={statusInfo}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          generatePDF={generatePDF}
          router={router}
          email={email}
          first_name={first_name}
          last_name={last_name}
        />
      )}
    </Suspense>
  );
};

export default PaymentResultPage;