"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { verifyCheckoutPayment } from "@/lib/api";

export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") || "annual_pro";
  const amtParam = searchParams.get("amt") || "1179";
  const orderIdParam = searchParams.get("orderId") || "order_pending";
  const { user, refreshProfile } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const activeUserId = user?.id || "demo_pro";
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      await verifyCheckoutPayment({
        userId: activeUserId,
        plan: planParam,
        orderId: orderIdParam,
        paymentId,
      });
      await refreshProfile();
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      router.push(`/checkout/success?plan=${planParam}&paymentId=${paymentId}`);
    }
  };

  const handleDecline = () => {
    router.push("/checkout/declined");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">verified_user</span>
            <span className="font-bold text-sm text-zinc-900">3D Secure 2.0 Auth</span>
          </div>
          <span className="font-mono text-xs font-bold text-zinc-400">VISA PROTECT</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-zinc-50">
            <span className="text-zinc-500">Merchant</span>
            <span className="font-bold text-zinc-900">ScanBeforeEat Inc</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-50">
            <span className="text-zinc-500">Transaction Amount</span>
            <span className="font-mono font-bold text-zinc-900">₹{parseFloat(amtParam).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-50">
            <span className="text-zinc-500">Card</span>
            <span className="font-mono text-zinc-600">•••• •••• •••• 4242</span>
          </div>
        </div>

        <div className="bg-zinc-50 p-4 rounded-xl text-center space-y-3">
          <p className="text-xs text-zinc-600">
            A one-time password has been sent to your registered mobile number ending in{" "}
            <strong>•••90</strong>.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-48 mx-auto px-4 py-2.5 text-center font-mono text-lg tracking-widest bg-white border-2 border-emerald-500 rounded-xl focus:outline-hidden"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDecline}
                className="flex-1 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                {loading ? "Authenticating..." : "Submit OTP"}
              </button>
            </div>
          </form>
        </div>

        <div className="text-[10px] text-zinc-400 text-center font-mono">
          Safe 256-bit payment encryption protocol. Do not refresh.
        </div>
      </div>
    </div>
  );
}
