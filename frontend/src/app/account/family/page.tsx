"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchFamilyMembers, addFamilyMember, deleteFamilyMember, FamilyMember } from "@/lib/api";

export default function FamilyPage() {
  const { user, loginDemo } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Child");
  const [allergensText, setAllergensText] = useState("Peanuts, Tartrazine (Yellow 5)");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) loginDemo("monthly_pro");
  }, [user, loginDemo]);

  useEffect(() => {
    if (user?.id) loadMembers();
  }, [user?.id]);

  const loadMembers = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchFamilyMembers(user.id);
      setMembers(data);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setSubmitting(true);
    const allergens = allergensText
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    try {
      const created = await addFamilyMember({
        userId: user.id,
        name,
        relationship,
        allergens,
      });
      setMembers([...members, created]);
      setShowAddModal(false);
      setName("");
      setAllergensText("");
    } catch {
      const initials = name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const local: FamilyMember = {
        id: `f_${Date.now()}`,
        userId: user.id,
        name,
        relationship,
        allergens,
        avatar: initials,
        createdAt: new Date().toISOString(),
      };
      setMembers([...members, local]);
      setShowAddModal(false);
      setName("");
      setAllergensText("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    try {
      await deleteFamilyMember(id);
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
              Family & Sub-Accounts Manager
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Configure multi-profile allergen guards and children&apos;s pediatric additive exclusion lists
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span>Add Family Profile</span>
          </button>
        </div>

        {/* Family Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-base font-display">
                    {member.avatar || member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-mono text-[10px] rounded uppercase font-semibold">
                    {member.relationship}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-zinc-900 mt-3 font-display">
                  {member.name}
                </h3>

                <div className="mt-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1.5">
                    Excluded Triggers ({member.allergens.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {member.allergens.map((alg, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-amber-50 border border-amber-200/80 text-amber-900 text-[10px] rounded font-medium"
                      >
                        {alg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {member.relationship !== "Self" && (
                <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors text-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span>Remove Profile</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-base text-zinc-900">Add Family Member</h3>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Child">Child</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Dependent">Dependent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">
                    Allergens & Chemicals (Comma-separated)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Peanuts, Gluten, Tartrazine (Yellow 5), Red 40"
                    value={allergensText}
                    onChange={(e) => setAllergensText(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                  >
                    {submitting ? "Saving..." : "Create Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
