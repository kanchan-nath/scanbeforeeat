import React, { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-zinc-500 font-mono text-xs">
          Loading confirmation...
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
