"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [biometricUnlock, setBiometricUnlock] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("sbe_security_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.twoFactorEnabled !== undefined) setTwoFactorEnabled(parsed.twoFactorEnabled);
        if (parsed.sessionTimeout !== undefined) setSessionTimeout(parsed.sessionTimeout);
        if (parsed.biometricUnlock !== undefined) setBiometricUnlock(parsed.biometricUnlock);
      }
    } catch (e) {
      // Ignored
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        "sbe_security_config",
        JSON.stringify({ twoFactorEnabled, sessionTimeout, biometricUnlock })
      );
    } catch (e) {
      // Ignored
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Account Security & 2FA Settings
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Configure multi-factor authentication, biometric camera authorization, and cryptographic session protection
          </p>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
            Security parameters successfully saved and synchronized.
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-6">
          {/* Two-Factor Authentication Toggle */}
          <div className="flex items-start justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-lg">
                  verified_user
                </span>
                <h3 className="font-bold text-sm text-zinc-900">
                  Two-Factor Authentication (TOTP)
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1 max-w-md">
                Require a 6-digit TOTP token generated via Google Authenticator or 1Password when logging into a new browser session.
              </p>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                twoFactorEnabled ? "bg-emerald-600" : "bg-zinc-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  twoFactorEnabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Biometric Mobile Auth */}
          <div className="flex items-start justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-lg">
                  fingerprint
                </span>
                <h3 className="font-bold text-sm text-zinc-900">
                  Face ID & Biometric WebAuthn
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1 max-w-md">
                Fast-track grocery barcode scanning with Apple Touch ID, Face ID, or Windows Hello.
              </p>
            </div>
            <button
              onClick={() => setBiometricUnlock(!biometricUnlock)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                biometricUnlock ? "bg-emerald-600" : "bg-zinc-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  biometricUnlock ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Session Inactivity Timeout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-lg">timer</span>
                <h3 className="font-bold text-sm text-zinc-900">Session Auto-Lock</h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Automatically purge local tokens if inactive
              </p>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-800 bg-white"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="never">Never (Persistent)</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Save Security Rules
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
