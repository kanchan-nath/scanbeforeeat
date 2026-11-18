"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchSessions, deleteSession, revokeAllSessions, UserSession } from "@/lib/api";

export default function ActiveSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const loadSessions = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchSessions(user.id);
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user?.id]);

  const handleRevoke = async (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    try {
      await deleteSession(id);
      setStatusNotice("Device session successfully revoked.");
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (err) {
      console.error("Failed to revoke session:", err);
    }
  };

  const handleRevokeAll = async () => {
    if (!user?.id) return;
    setSessions(sessions.filter((s) => Boolean(s.isCurrent)));
    try {
      await revokeAllSessions(user.id);
      setStatusNotice("All other sessions have been terminated.");
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (err) {
      console.error("Failed to revoke all sessions:", err);
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Active Sessions & Devices
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Monitor active hardware authorized to access your personal dietary dossier and scan logs
            </p>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAll}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all border border-rose-200 self-start sm:self-auto"
            >
              Sign Out All Other Devices
            </button>
          )}
        </div>

        {statusNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
            {statusNotice}
          </div>
        )}

        <div className="space-y-4">
          {sessions.map((sess) => {
            const isCur = Boolean(sess.isCurrent);
            const icon = sess.device.toLowerCase().includes("iphone") || sess.device.toLowerCase().includes("android") || sess.device.toLowerCase().includes("mobile")
              ? "smartphone"
              : "laptop_mac";

            return (
              <div
                key={sess.id}
                className={`bg-white rounded-xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isCur ? "border-emerald-600 shadow-xs ring-1 ring-emerald-600/20" : "border-zinc-200 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900">{sess.device}</span>
                      {isCur && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                          This Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {sess.browser} • {sess.location} • IP: {sess.ip}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-1">
                      Last active: {sess.lastActiveAt}
                    </div>
                  </div>
                </div>

                {!isCur && (
                  <button
                    onClick={() => handleRevoke(sess.id)}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-700 text-xs font-semibold rounded-lg transition-colors self-end sm:self-auto"
                  >
                    Revoke Device
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
