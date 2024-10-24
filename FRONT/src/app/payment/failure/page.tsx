"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';

const PaymentFailurePage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const collection_id = searchParams.get('collection_id') || 'N/A';
  const collection_status = searchParams.get('collection_status') || 'N/A';
  const payment_id = searchParams.get('payment_id') || 'N/A';
  const status = searchParams.get('status') || 'N/A';
  const external_reference = searchParams.get('external_reference') || 'N/A';
  const payment_type = searchParams.get('payment_type') || 'N/A';
  const merchant_order_id = searchParams.get('merchant_order_id') || 'N/A';
  const preference_id = searchParams.get('preference_id') || 'N/A';
  const site_id = searchParams.get('site_id') || 'N/A';
  const processing_mode = searchParams.get('processing_mode') || 'N/A';
  const merchant_account_id = searchParams.get('merchant_account_id') || 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failure
          </h1>
          <p className="text-lg text-gray-600">
            Unfortunately, your payment could not be processed. Please review the details below:
          </p>
        </div>

        <div className="mb-6 bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Collection ID</p>
                <p className="font-medium">{collection_id}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Collection Status</p>
                <p className="font-medium">{collection_status}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Payment ID</p>
                <p className="font-medium">{payment_id}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{status}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">External Reference</p>
                <p className="font-medium">{external_reference}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Payment Type</p>
                <p className="font-medium">{payment_type}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Merchant Order ID</p>
                <p className="font-medium">{merchant_order_id}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Preference ID</p>
                <p className="font-medium">{preference_id}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Site ID</p>
                <p className="font-medium">{site_id}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Processing Mode</p>
                <p className="font-medium">{processing_mode}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Merchant Account ID</p>
                <p className="font-medium">{merchant_account_id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/cart')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Return to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;