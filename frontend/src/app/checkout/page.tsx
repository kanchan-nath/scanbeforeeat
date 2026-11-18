import React, { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-zinc-500 font-mono text-xs">
          Loading checkout gateway...
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
