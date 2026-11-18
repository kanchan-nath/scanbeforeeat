"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchInvoices, getInvoicePdfUrl, InvoiceItem } from "@/lib/api";

export default function InvoicesPage() {
  const { user, loginDemo } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) loginDemo("monthly_pro");
  }, [user, loginDemo]);

  useEffect(() => {
    if (user?.id) {
      loadInvoices();
    }
  }, [user?.id]);

  const loadInvoices = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchInvoices(user.id);
      setInvoices(data);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id: string, number: string) => {
    const url = getInvoicePdfUrl(id);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${number}.pdf`;
    link.target = "_blank";
    link.click();
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Invoices & Payment History
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Download GST-compliant tax invoices and historical subscription billing receipts
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-3">Invoice Number</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Plan / Description</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                      No invoices recorded yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-zinc-900">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-zinc-500">{inv.date}</td>
                      <td className="px-6 py-4 font-medium text-zinc-900">{inv.description}</td>
                      <td className="px-6 py-4 font-mono font-bold text-zinc-900">₹{inv.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] rounded">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownload(inv.id, inv.invoiceNumber)}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
