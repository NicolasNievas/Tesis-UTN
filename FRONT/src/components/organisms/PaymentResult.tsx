"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ArrowLeft, CreditCard, Calendar, User, Package } from 'lucide-react';

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

const PaymentResultPage: React.FC<PaymentResultPageProps> = ({ type }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const email = paymentDetails?.external_reference.split('|||')[1];
  const { first_name, last_name } = paymentDetails?.additional_info?.payer[0] || {};


  const payment_id = searchParams.get('payment_id') || 'N/A';
  const status = searchParams.get('status') || 'failure';

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
          headers: {
            'Authorization': 'Bearer APP_USR-3381691299265753-101517-1dc718032f38a6d0abf3cb4c3492d9e6-2037404181'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener los detalles del pago');
        }

        const data = await response.json();
        setPaymentDetails(data);
      } catch (err) {
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
          title: '¡Gracias por tu compra!',
          message: 'Tu pedido ha sido procesado correctamente.',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800'
        };
      case 'pending':
        return {
            icon: <Clock className="h-12 w-12 text-yellow-500" />,
            title: 'Pago pendiente',
            message: 'Tu pago está siendo procesado.',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-800'
          };
        
      default:
        return {
            icon: <XCircle className="h-12 w-12 text-red-500" />,
            title: 'No se pudo procesar tu pago',
            message: 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.',
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
          <p className="mt-4">Cargando detalles del pago...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

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
                <h2 className="text-xl font-semibold">Detalles de la compra</h2>
                <div className={`px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                  {status === 'approved' ? 'Aprobado' : 
                   status === 'pending' ? 'Pendiente' : 'Fallido'}
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
                        Cantidad: {item.quantity} × {formatCurrency(Number(item.unit_price))}
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
                        <p className="text-sm text-gray-500">Datos del comprador</p>
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
                      <p className="text-sm text-gray-500">Método de Pago</p>
                    </div>
                    <p className="font-medium">
                      {paymentDetails.payment_type_id}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Fecha de Compra</p>
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

        <div className="mt-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;