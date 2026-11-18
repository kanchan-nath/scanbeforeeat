import React, { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-zinc-500 font-mono text-xs">
          Loading 3D Secure verification...
        </div>
      }
    >
      <VerifyClient />
    </Suspense>
  );
}
