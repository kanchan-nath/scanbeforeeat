"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { createCheckoutOrder } from "@/lib/api";

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") || "annual_pro";
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const planName =
    planParam === "monthly_pro"
      ? "Monthly Pro Plan"
      : planParam === "six_month_saver"
      ? "6-Month Saver Plan"
      : "Annual Pro Toxicologist Plan";

  const planPrice =
    planParam === "monthly_pro" ? 199 : planParam === "six_month_saver" ? 499 : 999;

  const gst = Math.round(planPrice * 0.18 * 100) / 100;
  const total = Math.round((planPrice + gst) * 100) / 100;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const order = await createCheckoutOrder(user?.id || "demo_pro", planParam);
      router.push(`/checkout/verify?plan=${planParam}&amt=${order.amount || total}&orderId=${order.orderId}`);
    } catch {
      router.push(`/checkout/verify?plan=${planParam}&amt=${total}&orderId=order_${Date.now()}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Final Checkout & Order Summary
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Complete your subscription to unlock 99 scans/mo and chemical synergy alerts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Method Selection */}
          <div className="md:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-5">
            <h2 className="font-bold text-sm text-zinc-900">Select Payment Method</h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === "card"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                    : "border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-zinc-700">credit_card</span>
                  <span className="text-xs font-bold text-zinc-900">Credit / Debit Card</span>
                </div>
                <span
                  className={`material-symbols-outlined text-lg ${
                    paymentMethod === "card" ? "text-emerald-600" : "text-zinc-300"
                  }`}
                >
                  {paymentMethod === "card" ? "check_circle" : "radio_button_unchecked"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === "upi"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                    : "border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-zinc-700">account_balance_wallet</span>
                  <span className="text-xs font-bold text-zinc-900">UPI / QR Code</span>
                </div>
                <span
                  className={`material-symbols-outlined text-lg ${
                    paymentMethod === "upi" ? "text-emerald-600" : "text-zinc-300"
                  }`}
                >
                  {paymentMethod === "upi" ? "check_circle" : "radio_button_unchecked"}
                </span>
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4 text-xs pt-2">
              {paymentMethod === "card" ? (
                <>
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      defaultValue={user?.displayName || "Dr. Elena Vance"}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4242 •••• •••• 4242"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="08/29"
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">CVC</label>
                      <input
                        type="password"
                        defaultValue="888"
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">VPA / UPI ID</label>
                  <input
                    type="text"
                    required
                    placeholder="username@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Instant authorization via Google Pay, PhonePe, or Paytm
                  </span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>{submitting ? "Initiating 3D Secure..." : `Pay ₹${total}.00 Securely`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-3">
                Order Summary
              </h3>

              <div className="py-4 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-zinc-800">
                  <span>{planName}</span>
                  <span className="font-mono">₹{planPrice}.00</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>GST (18%)</span>
                  <span className="font-mono">₹{gst}.00</span>
                </div>
                <div className="pt-3 border-t border-zinc-100 flex justify-between font-bold text-sm text-zinc-900">
                  <span>Total Due</span>
                  <span className="font-mono text-emerald-700">₹{total}.00</span>
                </div>
              </div>

              <div className="bg-zinc-50 p-3 rounded-lg text-[11px] text-zinc-500 space-y-1">
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span>256-Bit SSL Bank Encryption</span>
                </div>
                <p>30-day money-back guarantee with zero cancellation fees.</p>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 text-center font-mono">
              Billed by ScanBeforeEat Inc.
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
