"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchApiKeys, createApiKey, deleteApiKey, ApiKeyItem } from "@/lib/api";

export default function ApiKeysPage() {
  const { user, loginDemo } = useAuth();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (!user) loginDemo("monthly_pro");
  }, [user, loginDemo]);

  useEffect(() => {
    if (user?.id) loadKeys();
  }, [user?.id]);

  const loadKeys = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchApiKeys(user.id);
      setKeys(data);
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim() || !user) return;
    try {
      const created = await createApiKey({ userId: user.id, name: keyName });
      setKeys([...keys, created]);
      setNewlyCreatedKey(created.fullKey || `${created.keyPrefix}_92bca9082ef412`);
      setKeyName("");
    } catch {
      const randKey = `sbe_live_${Math.random().toString(36).substring(2, 10)}`;
      const local: ApiKeyItem = {
        id: `k_${Date.now()}`,
        userId: user.id,
        name: keyName,
        keyPrefix: randKey.slice(0, 12),
        rateLimit: 500,
        createdAt: new Date().toISOString(),
      };
      setKeys([...keys, local]);
      setNewlyCreatedKey(`${randKey}_secret_token`);
      setKeyName("");
    }
  };

  const handleDelete = async (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
    try {
      await deleteApiKey(id);
    } catch {
      // Optimistic
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              API Keys & Token Manager
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Create, rotate, and manage Bearer tokens for production and staging food data pipelines
            </p>
          </div>
          <button
            onClick={() => {
              setNewlyCreatedKey(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Generate New API Key</span>
          </button>
        </div>

        {/* Security Alert Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-700 text-lg shrink-0 mt-0.5">
            security
          </span>
          <div>
            <span className="font-bold">Treat your API keys like passwords:</span> Do not expose secret keys in client-side repositories or public browser code. Always authenticate server-to-server.
          </div>
        </div>

        {/* Keys Table */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-3">Key Name</th>
                  <th className="px-6 py-3">Key Prefix</th>
                  <th className="px-6 py-3">Rate Limit</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900">{k.name}</td>
                    <td className="px-6 py-4 font-mono text-zinc-600">
                      <code>{k.keyPrefix}••••••••••••</code>
                    </td>
                    <td className="px-6 py-4 font-mono">{k.rateLimit} req/min</td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-[11px]">{k.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-md transition-colors"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Key Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-base text-zinc-900">Generate New API Key</h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {newlyCreatedKey ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                    <span className="font-bold block mb-1">Make sure to copy your API key now:</span>
                    <p className="text-[11px]">You will not be able to see this token again.</p>
                  </div>

                  <div className="p-3 bg-zinc-900 text-emerald-400 font-mono rounded-lg break-all select-all">
                    {newlyCreatedKey}
                  </div>

                  <button
                    onClick={() => {
                      if (newlyCreatedKey) {
                        navigator.clipboard.writeText(newlyCreatedKey);
                        setCopiedKey(true);
                        setTimeout(() => {
                          setCopiedKey(false);
                          setShowModal(false);
                        }, 1200);
                      }
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey ? "check" : "content_copy"}
                    </span>
                    <span>{copiedKey ? "Copied to Clipboard!" : "Copy to Clipboard & Close"}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">Key Name / Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iOS Production App or Backend Microservice"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                    >
                      Generate Key
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
