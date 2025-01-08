"use client"
import { Suspense } from "react";
import PaymentResultPage from "@/components/organisms/PaymentResult";

export default function PendingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResultPage type="pending" />
    </Suspense>
  );
}