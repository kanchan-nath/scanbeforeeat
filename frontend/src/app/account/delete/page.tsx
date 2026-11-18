"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { deleteUserAccount } from "@/lib/api";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      if (user?.id) {
        await deleteUserAccount(user.id);
      }
    } catch (err) {
      console.error("Failed to delete account on server:", err);
    }
    await logout();
    router.push("/auth");
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-rose-700 font-display">
            Delete Account & Permanent Data Purge
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Irrevocably erase your profile, personal toxicological exposure ledger, and all historical scan records
          </p>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-rose-600 text-xl shrink-0 mt-0.5">
              warning
            </span>
            <div className="text-xs text-rose-900 space-y-1">
              <span className="font-bold block">Warning: This action cannot be undone</span>
              <p>
                Deleting your account will immediately purge:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-rose-800">
                <li>All historical barcode and OCR food audits</li>
                <li>Digital Pantry stock catalog and expiration tracking</li>
                <li>Custom allergen sensitivity matrix and banned additives rules</li>
                <li>All active production and test API tokens</li>
                <li>Active subscription tier and recurring billing records</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleDelete} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-800 font-semibold mb-1">
                To confirm permanent deletion, please type <strong className="font-mono text-rose-600">DELETE</strong> below:
              </label>
              <input
                type="text"
                required
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={confirmText !== "DELETE" || isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                <span>{isDeleting ? "Purging Data..." : "Permanently Purge My Account"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
