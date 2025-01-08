import { Suspense } from "react";
import dynamic from "next/dynamic";

const PaymentResultPage = dynamic(
  () => import("@/components/organisms/PaymentResult"),
  { ssr: false }
);

export default function PendingPage(){
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <PaymentResultPage type="pending" />
        </Suspense>
    );
}