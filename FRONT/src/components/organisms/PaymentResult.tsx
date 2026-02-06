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
    [key: string]: string | number | undefined;
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
    [key: string]: string | number | undefined;
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

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
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

  const getStatusColor = (status: string): [number, number, number] => {
    switch (status) {
      case 'approved':
        return [39, 174, 96]; // Green
      case 'pending':
        return [241, 196, 15]; // Yellow
      case 'failure':
      case 'rejected':
        return [231, 76, 60]; // Red
      default:
        return [149, 165, 166]; // Gray
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'APPROVED';
      case 'pending':
        return 'PENDING';
      case 'failure':
      case 'rejected':
        return 'FAILED';
      default:
        return status.toUpperCase();
    }
  };

  const generatePDF = () => {
    if (!paymentDetails) {
      console.error('No payment details available');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4') as JsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // ========================================
    // HEADER SECTION
    // ========================================
    
    // Company Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    doc.text('Coffee Craze', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Document Title
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text('Purchase Receipt', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Status Badge
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);
    
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    const badgeWidth = doc.getTextWidth(statusText) + 20;
    doc.roundedRect((pageWidth - badgeWidth) / 2, yPos - 5, badgeWidth, 10, 3, 3, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(statusText, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Transaction ID and Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Transaction ID: ${payment_id}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text(`Date: ${formatDate(paymentDetails.date_created)}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    // ========================================
    // BUYER INFORMATION
    // ========================================
    
    const email = paymentDetails.metadata?.user_email || 
                  paymentDetails.external_reference?.split('|||')[1] || 
                  paymentDetails.payer?.email || 
                  '';
    const firstName = paymentDetails.metadata?.user_first_name || 
                     paymentDetails.additional_info?.payer?.first_name || 
                     paymentDetails.payer?.first_name || 
                     '';
    const lastName = paymentDetails.metadata?.user_last_name || 
                    paymentDetails.additional_info?.payer?.last_name || 
                    paymentDetails.payer?.last_name || 
                    '';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('Buyer Information', 20, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    doc.text(`Name:`, 20, yPos);
    doc.text(`${firstName} ${lastName}`, 50, yPos);
    yPos += 6;
    
    doc.text(`Email:`, 20, yPos);
    doc.text(email, 50, yPos);
    yPos += 6;

    if (paymentDetails.payer?.identification) {
      const docType = paymentDetails.metadata?.user_type_doc || paymentDetails.payer.identification.type;
      const docNumber = paymentDetails.metadata?.user_nro_doc || paymentDetails.payer.identification.number;
      doc.text(`${docType}:`, 20, yPos);
      doc.text(docNumber, 50, yPos);
      yPos += 6;
    }

    yPos += 5;

    // ========================================
    // SHIPPING INFORMATION
    // ========================================
    
    const shippingInfo = paymentDetails.metadata ? {
      method: paymentDetails.metadata.shipping_method_name?.toLowerCase() || 'standard',
      display_name: paymentDetails.metadata.shipping_display_name || 
                    paymentDetails.metadata.shipping_method_name || 
                    'Standard Shipping',
      cost: parseFloat(paymentDetails.metadata.shipping_cost || '0'),
      estimated_days: paymentDetails.metadata.shipping_estimated_days,
      address: paymentDetails.metadata.shipping_address || '',
      city: paymentDetails.metadata.shipping_city || '',
      postal_code: paymentDetails.metadata.shipping_postal_code || '',
      description: paymentDetails.metadata.shipping_description || '',
      isPickup: paymentDetails.metadata.shipping_method_name?.toLowerCase() === 'local_pickup' ||
                paymentDetails.metadata.shipping_display_name?.toLowerCase().includes('pickup')
    } : null;

    if (shippingInfo && (shippingInfo.address || shippingInfo.isPickup)) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);
      doc.text(shippingInfo.isPickup ? 'Pickup Information' : 'Shipping Information', 20, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);

      if (shippingInfo.isPickup) {
        doc.text(`Method:`, 20, yPos);
        doc.text('Store Pickup', 50, yPos);
        yPos += 6;
        
        doc.text(`Location:`, 20, yPos);
        doc.text('Tandil 1877, Córdoba', 50, yPos);
        yPos += 6;
        
        doc.text(`Availability:`, 20, yPos);
        const readyText = !shippingInfo.estimated_days || shippingInfo.estimated_days === 0 
          ? 'Ready for pickup today'
          : `Ready in ${shippingInfo.estimated_days} business days`;
        doc.text(readyText, 50, yPos);
        yPos += 6;
      } else {
        doc.text(`Method:`, 20, yPos);
        doc.text(shippingInfo.display_name, 50, yPos);
        yPos += 6;

        if (shippingInfo.address) {
          doc.text(`Address:`, 20, yPos);
          doc.text(shippingInfo.address, 50, yPos);
          yPos += 6;
          
          if (shippingInfo.city) {
            doc.text(`City:`, 20, yPos);
            doc.text(`${shippingInfo.city}${shippingInfo.postal_code ? ` (CP: ${shippingInfo.postal_code})` : ''}`, 50, yPos);
            yPos += 6;
          }
        }

        if (shippingInfo.estimated_days) {
          doc.text(`Est. Delivery:`, 20, yPos);
          const deliveryText = shippingInfo.estimated_days === 0 
            ? 'Same day delivery'
            : `${shippingInfo.estimated_days} business days`;
          doc.text(deliveryText, 50, yPos);
          yPos += 6;
        }
      }

      yPos += 5;
    }

    // ========================================
    // PAYMENT INFORMATION
    // ========================================
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('Payment Information', 20, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    doc.text(`Payment Method:`, 20, yPos);
    doc.text(paymentDetails.payment_type_id.replace(/_/g, ' ').toUpperCase(), 65, yPos);
    yPos += 6;
    
    doc.text(`Payment Date:`, 20, yPos);
    doc.text(formatDate(paymentDetails.date_created), 65, yPos);
    yPos += 10;

    // ========================================
    // PRODUCTS TABLE
    // ========================================
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('Products', 20, yPos);
    yPos += 5;

    const tableHeaders = [['Product', 'Quantity', 'Unit Price', 'Subtotal']];
    const tableData = paymentDetails.additional_info.items.map(item => [
      item.title,
      item.quantity.toString(),
      formatCurrency(Number(item.unit_price)),
      formatCurrency(Number(item.unit_price) * Number(item.quantity))
    ]);

    autoTable(doc, {
      startY: yPos,
      head: tableHeaders,
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 60]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // ========================================
    // TOTALS SECTION
    // ========================================
    
    const xRight = pageWidth - 20;
    const xLabel = xRight - 60;
    
    // Products Subtotal
    const productsSubtotal = paymentDetails.additional_info.items.reduce(
      (sum, item) => sum + (Number(item.unit_price) * Number(item.quantity)), 
      0
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Products Subtotal:', xLabel, yPos, { align: 'right' });
    doc.text(formatCurrency(productsSubtotal), xRight, yPos, { align: 'right' });
    yPos += 6;

    // Shipping Cost
    const shippingCost = shippingInfo?.cost || 0;
    if (shippingCost > 0) {
      doc.text('Shipping:', xLabel, yPos, { align: 'right' });
      doc.text(formatCurrency(shippingCost), xRight, yPos, { align: 'right' });
      yPos += 6;
    }

    // Total line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(xLabel - 5, yPos, xRight, yPos);
    yPos += 7;

    // Total Amount
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text('TOTAL:', xLabel, yPos, { align: 'right' });
    
    const statusColorForTotal = getStatusColor(status);
    doc.setTextColor(statusColorForTotal[0], statusColorForTotal[1], statusColorForTotal[2]);
    doc.text(formatCurrency(paymentDetails.transaction_amount), xRight, yPos, { align: 'right' });
    yPos += 15;

    // ========================================
    // STATUS-SPECIFIC MESSAGES
    // ========================================
    
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, yPos - 3, pageWidth - 40, 25, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);

    switch (status) {
      case 'approved':
        doc.text('✓ Payment Successful', 25, yPos + 3);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Your order has been confirmed and is being processed.', 25, yPos + 9);
        doc.text('You will receive updates via email at: ' + email, 25, yPos + 14);
        break;
      case 'pending':
        doc.text('⏱ Payment Pending', 25, yPos + 3);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Your payment is being processed by the payment provider.', 25, yPos + 9);
        doc.text('This may take up to 24 hours. We will notify you once confirmed.', 25, yPos + 14);
        break;
      case 'failure':
      case 'rejected':
        doc.text('✗ Payment Failed', 25, yPos + 3);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Your payment could not be processed. Please check your payment method.', 25, yPos + 9);
        doc.text('Contact support at coffecraze1@gmail.com for assistance.', 25, yPos + 14);
        break;
    }

    yPos += 30;

    // ========================================
    // FOOTER
    // ========================================
    
    const footerY = doc.internal.pageSize.getHeight() - 20;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('This is an electronic receipt for your purchase.', pageWidth / 2, footerY, { align: 'center' });
    doc.text('For questions or support: coffecraze1@gmail.com', pageWidth / 2, footerY + 4, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} Coffee Craze. All rights reserved.`, pageWidth / 2, footerY + 8, { align: 'center' });

    // ========================================
    // SAVE PDF
    // ========================================
    
    const filename = `coffee-craze-receipt-${payment_id}-${status}.pdf`;
    doc.save(filename);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Payment</h2>
          <p className="text-gray-600 mb-6">{error || 'Could not load payment details'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Home
          </button>
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