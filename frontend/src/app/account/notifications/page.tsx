"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchNotifications, updateNotifications } from "@/lib/api";

interface PrefItem {
  id: string;
  key: "allergenAlert" | "synergyAlert" | "weeklyDigest" | "newStudies" | "quotaAlert";
  title: string;
  desc: string;
  enabled: boolean;
}

const DEFAULT_PREFS: PrefItem[] = [
  {
    id: "allergen_alert",
    key: "allergenAlert",
    title: "Immediate Lethal Allergen Interception",
    desc: "Instant vibration and red cockpit strobe alert when a scanned food triggers your allergen matrix.",
    enabled: true,
  },
  {
    id: "synergy_alert",
    key: "synergyAlert",
    title: "Chemical Synergy & Cocktail Alarm",
    desc: "Notify when combining two foods creates a high-risk reactive synergy (e.g. Benzoate + Vitamin C).",
    enabled: true,
  },
  {
    id: "weekly_digest",
    key: "weeklyDigest",
    title: "Weekly Chemical Exposure Digest (PDF)",
    desc: "Receive an email summary of your 7-day cumulative additive load vs EFSA safe ceilings.",
    enabled: true,
  },
  {
    id: "new_studies",
    key: "newStudies",
    title: "PubMed & IARC Regulatory Recalls",
    desc: "Alert when a new clinical trial publishes on additives currently stored in your Digital Pantry.",
    enabled: false,
  },
  {
    id: "quota_alert",
    key: "quotaAlert",
    title: "Monthly Scan Quota Warning",
    desc: "Notify when you have 3 or fewer scans remaining in your billing cycle.",
    enabled: true,
  },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<PrefItem[]>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications(user.id)
      .then((data: any) => {
        setPrefs((prev) =>
          prev.map((item) => ({
            ...item,
            enabled: data[item.key] !== undefined ? Boolean(data[item.key]) : item.enabled,
          }))
        );
      })
      .catch((err) => console.error("Could not load notifications:", err));
  }, [user?.id]);

  const togglePref = (id: string) => {
    setPrefs(prefs.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const handleSave = async () => {
    if (user?.id) {
      const payload: Record<string, boolean> = {};
      prefs.forEach((p) => {
        payload[p.key] = p.enabled;
      });
      try {
        await updateNotifications(user.id, payload);
      } catch (err) {
        console.error("Failed to update notifications:", err);
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Notification & Alert Preferences
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Control push notification thresholds, audio camera tones, and weekly toxicology summary emails
          </p>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
            Notification preferences successfully updated.
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs divide-y divide-zinc-100">
          {prefs.map((p) => (
            <div key={p.id} className="p-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">{p.title}</h3>
                <p className="text-xs text-zinc-500 mt-0.5 max-w-lg">{p.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => togglePref(p.id)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  p.enabled ? "bg-emerald-600" : "bg-zinc-300"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    p.enabled ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          ))}

          <div className="p-4 flex justify-end bg-zinc-50">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Save Notification Rules
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
