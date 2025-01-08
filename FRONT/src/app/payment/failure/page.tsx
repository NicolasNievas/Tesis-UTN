import { Suspense } from "react";
import PaymentResultPage from "@/components/organisms/PaymentResult";

export default function FailurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResultPage type="failure" />
    </Suspense>
  );
}