/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { ArrowLeft, CreditCard, Calendar, User, Download } from 'lucide-react';

interface IPaymentDetailsContentProps {
    paymentDetails: {
        additional_info: {
            items: {
                picture_url: string;
                title: string;
                quantity: number;
                unit_price: number;
            }[];
        };
        payer: {
            identification?: {
                type: string;
                number: string;
            };
        };
        payment_type_id: string;
        date_created: string;
        transaction_amount: number;
    };
    status: string;
    statusInfo: {
        bgColor: string;
        icon: React.ReactNode;
        title: string;
        message: string;
        textColor: string;
    };
    formatDate: (date: string) => string;
    formatCurrency: (amount: number) => string;
    generatePDF: () => void;
   
    email: string;
    first_name: string;
    last_name: string;
    router: {
        push: (path: string) => void;
    };
}

export const PaymentDetailsContent: React.FC<IPaymentDetailsContentProps> = ({ 
  paymentDetails, 
  status, 
  statusInfo,
  formatDate, 
  formatCurrency, 
  generatePDF, 
  router,
  email,
  first_name,
  last_name
}) => {
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