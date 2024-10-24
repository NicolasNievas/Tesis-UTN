"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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
    <div className="container mx-auto h-screen py-8">
      <h2 className="text-2xl font-semibold mb-4">Payment Failure</h2>
      <p className="text-lg">Unfortunately, your payment could not be processed. Please review the details below:</p>
      <ul className="mt-4">
        <li><strong>Collection ID:</strong> {collection_id}</li>
        <li><strong>Collection Status:</strong> {collection_status}</li>
        <li><strong>Payment ID:</strong> {payment_id}</li>
        <li><strong>Status:</strong> {status}</li>
        <li><strong>External Reference:</strong> {external_reference}</li>
        <li><strong>Payment Type:</strong> {payment_type}</li>
        <li><strong>Merchant Order ID:</strong> {merchant_order_id}</li>
        <li><strong>Preference ID:</strong> {preference_id}</li>
        <li><strong>Site ID:</strong> {site_id}</li>
        <li><strong>Processing Mode:</strong> {processing_mode}</li>
        <li><strong>Merchant Account ID:</strong> {merchant_account_id}</li>
      </ul>
      <button
        onClick={() => router.push('/cart')}
        className="mt-4 p-2 bg-blue-500 text-white rounded-md"
      >
        Return to Cart
      </button>
    </div>
  );
};

export default PaymentFailurePage;