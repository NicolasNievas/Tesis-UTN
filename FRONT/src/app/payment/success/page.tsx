"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';

interface PaymentDetails {
  status: string;
  transaction_amount: number;
  payment_method_id: string;
  payment_type_id: string;
  date_created: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  additional_info: {
    items: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      picture_url?: string;
    }>;
  };
}

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const payment_id = searchParams.get('payment_id') || 'N/A';

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        // Simulación de datos de pago
        const data: PaymentDetails = {
          status: searchParams.get('status') || 'N/A',
          transaction_amount: 150.00, // Simulación de monto de transacción
          payment_method_id: searchParams.get('payment_type') || 'N/A',
          payment_type_id: searchParams.get('payment_type') || 'N/A',
          date_created: new Date().toISOString(),
          payer: {
            email: 'nicoonievas7@gmail.com',
            first_name: 'Nico',
            last_name: 'Nievas',
          },
          additional_info: {
            items: [
              {
                id: '1',
                title: 'Producto 1',
                quantity: 2,
                unit_price: 50.00,
                picture_url: 'https://bonafide.com.ar/media/2022/05/Sensaciones-Suave-125g-2-1-1-1-1-1-1-1.png',
              },
              {
                id: '2',
                title: 'Producto 2',
                quantity: 1,
                unit_price: 100.00,
                picture_url: 'https://via.placeholder.com/150',
              },
            ],
          },
        };
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
  }, [payment_id, searchParams]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_process':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getPaymentMethodName = (type: string) => {
    const methods: { [key: string]: string } = {
      credit_card: 'Tarjeta de Crédito',
      debit_card: 'Tarjeta de Débito',
      bank_transfer: 'Transferencia Bancaria',
      ticket: 'Pago en Efectivo',
      account_money: 'Dinero en Cuenta',
    };
    return methods[type] || type;
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}. Por favor, contacta con soporte si el problema persiste.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-lg text-gray-600">
            Tu pedido ha sido procesado correctamente.
          </p>
        </div>

        {paymentDetails && (
          <>
            <div className="mb-6 bg-white shadow-md rounded-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Resumen de la Compra</h2>
              </div>
              <div className="space-y-6">
                {/* Estado del Pago */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Estado del Pago</p>
                    <p className="font-medium">{payment_id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paymentDetails.status)}`}>
                    {paymentDetails.status === 'approved' ? 'Aprobado' : 
                     paymentDetails.status === 'pending' ? 'Pendiente' : 
                     paymentDetails.status === 'in_process' ? 'En Proceso' : 
                     paymentDetails.status}
                  </span>
                </div>

                {/* Detalles de los Productos */}
                <div className="border rounded-lg divide-y">
                  {paymentDetails.additional_info?.items?.map((item, index) => (
                    <div key={index} className="p-4 flex items-center space-x-4">
                      {item.picture_url ? (
                        <img 
                          src={item.picture_url} 
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 11h18M3 15h18M3 19h18" />
                        </svg>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Información del Pago */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                      </svg>
                      <p className="text-sm text-gray-500">Método de Pago</p>
                    </div>
                    <p className="font-medium">
                      {getPaymentMethodName(paymentDetails.payment_type_id)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-6 8h6m-6 4h6m-6 4h6" />
                      </svg>
                      <p className="text-sm text-gray-500">Fecha de Compra</p>
                    </div>
                    <p className="font-medium">
                      {formatDate(paymentDetails.date_created)}
                    </p>
                  </div>
                </div>

                {/* Total */}
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

            {paymentDetails.status === 'pending' && (
              <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                <svg className="h-4 w-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                </svg>
                <span className="block sm:inline">Tu pago está pendiente de confirmación. Te notificaremos por email cuando se complete.</span>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;