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
  metadata?: {
    user_email?: string;
    user_first_name?: string;
    user_last_name?: string;
    shipping_method_name?: string;
    shipping_display_name?: string;
    shipping_estimated_days?: number;
    shipping_description?: string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_postal_code?: string;
    shipping_cost?: string;
    user_nro_doc?: string;
    user_type_doc?: string;
    [key: string]: any;
  };
  additional_info: {
    items: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      picture_url: string;
      description?: string;
      category_id?: string;
    }>;
    payer: {
      first_name: string;
      last_name: string;
    };
  };
  payer: {
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    identification?: {
      type: string;
      number: string;
    };
  };
}

interface MercadoPagoResponse {
  metadata?: {
    [key: string]: any;
  };
  additional_info?: {
    items?: Array<{
      id?: string;
      title?: string;
      quantity?: string;
      unit_price?: string;
      picture_url?: string;
      description?: string;
      category_id?: string;
    }>;
    payer?: {
      first_name?: string;
      last_name?: string;
    };
  };
  external_reference?: string;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type: string;
      number: string;
    };  
  };
  status: string;
  transaction_amount?: number;
  payment_method_id?: string;
  payment_type_id?: string;
  date_created?: string;
  description?: string; 
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
    return new Intl.DateTimeFormat('en-US', {
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
    
    const email = paymentDetails?.metadata?.user_email || 
                paymentDetails?.external_reference?.split('|||')[1] || 
                '';
    const first_name = paymentDetails?.metadata?.user_first_name || 
                      paymentDetails?.additional_info?.payer?.first_name || 
                      '';
    const last_name = paymentDetails?.metadata?.user_last_name || 
                    paymentDetails?.additional_info?.payer?.last_name || 
                    '';

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
        // DEBUG: Ver la estructura completa
        console.log('Respuesta completa de MP:', data);
        
        // Procesar datos específicos para nuestra UI
        const processedData = processPaymentData(data);
        setPaymentDetails(processedData);
      } catch (err) {
        console.error(err);
        setError('Error al obtener los detalles del pago');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [payment_id]);


const processPaymentData = (data: MercadoPagoResponse): PaymentDetails => {
  // Extraer información de envío de los metadatos (preferido)
  const metadata = data.metadata || {};
  
  // Determinar el método de envío
  let shippingMethod = 'standard';
  let shippingDisplayName = 'Envío estándar';
  let shippingEstimatedDays = 3;
  
  // Usar metadatos si están disponibles
  if (metadata.shipping_method_name) {
    shippingMethod = String(metadata.shipping_method_name).toLowerCase();
    shippingDisplayName = String(metadata.shipping_display_name || metadata.shipping_method_name);
    shippingEstimatedDays = Number(metadata.shipping_estimated_days) || 3;
  } else {
    // Fallback al título del ítem de envío (para compatibilidad)
    const shippingItem = data.additional_info?.items?.find((item) => 
      item.category_id === 'shipping' || item.id === 'shipping'
    );
    
    if (shippingItem?.title) {
      const title = shippingItem.title;
      if (title.includes('Andreani')) {
        shippingMethod = 'andreani';
        shippingDisplayName = 'Andreani';
        shippingEstimatedDays = 4;
      } else if (title.includes('OCA')) {
        shippingMethod = 'oca';
        shippingDisplayName = 'OCA';
        shippingEstimatedDays = 3;
      } else if (title.includes('Correo')) {
        shippingMethod = 'correo_argentino';
        shippingDisplayName = 'Correo Argentino';
        shippingEstimatedDays = 5;
      }
    }
  }
  
  // Separar ítems de productos vs envío
  const allItems = data.additional_info?.items || [];
  const productItems = allItems.filter((item) => 
    item.category_id !== 'shipping' && item.id !== 'shipping'
  );
  
  // Formatear los ítems para la UI
  const formattedItems = productItems.map((item) => ({
    id: item.id || '',
    title: item.title || '',
    quantity: parseInt(String(item.quantity || '1')) || 1,
    unit_price: parseFloat(String(item.unit_price || '0')) || 0,
    picture_url: item.picture_url || '',
    description: item.description || '',
    category_id: item.category_id || ''
  }));
  
  // Determinar email (usar metadatos primero, luego fallbacks)
  let email = String(metadata.user_email || '');
  if (!email) {
    const externalRef = data.external_reference || '';
    if (externalRef.includes('|||')) {
      const parts = externalRef.split('|||');
      if (parts.length >= 2 && parts[1].includes('@')) {
        email = parts[1];
      }
    }
  }
  if (!email) {
    email = data.payer?.email || '';
  }
  
  // Extraer datos del payer (usar metadatos primero)
  const payerFirstName = String(metadata.user_first_name || 
                        data.additional_info?.payer?.first_name || 
                        data.payer?.first_name || '');
  const payerLastName = String(metadata.user_last_name || 
                       data.additional_info?.payer?.last_name || 
                       data.payer?.last_name || '');
  
  // Crear el objeto procesado
  return {
    status: data.status,
    transaction_amount: data.transaction_amount || 0,
    payment_method_id: data.payment_method_id || '',
    payment_type_id: data.payment_type_id || '',
    date_created: data.date_created || '',
    external_reference: data.external_reference || '',
    description: data.description || '',
    metadata: metadata,
    additional_info: {
      items: formattedItems,
      payer: {
        first_name: payerFirstName,
        last_name: payerLastName
      }
    },
    payer: {
      email: email || null,
      first_name: payerFirstName || null,
      last_name: payerLastName || null,
      identification: data.payer?.identification || undefined
    }
  };
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
  const email = paymentDetails?.metadata?.user_email || 
               paymentDetails?.external_reference?.split('|||')[1] || 
               '';
  const first_name = paymentDetails?.metadata?.user_first_name || 
                    paymentDetails?.additional_info?.payer?.first_name || 
                    '';
  const last_name = paymentDetails?.metadata?.user_last_name || 
                   paymentDetails?.additional_info?.payer?.last_name || 
                   '';

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