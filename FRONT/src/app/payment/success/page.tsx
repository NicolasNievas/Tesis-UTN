// pages/payment/success.tsx (and similar for pending/failure)
import { Suspense } from "react";
import dynamic from 'next/dynamic';

const PaymentResultPage = dynamic(
  () => import('@/components/organisms/PaymentResult'),
  { ssr: false }
);

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResultPage type="success" />
    </Suspense>
  );
}