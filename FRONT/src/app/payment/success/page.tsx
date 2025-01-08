import { Suspense } from "react";
import PaymentResultPage from "@/components/organisms/PaymentResult";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResultPage type="success" />
    </Suspense>
  );
}