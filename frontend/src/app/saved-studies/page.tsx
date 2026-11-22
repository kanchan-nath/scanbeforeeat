"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchSavedStudies, deleteSavedStudy, SavedStudy } from "@/lib/api";

export default function SavedStudiesPage() {
  const { user } = useAuth();
  const [studies, setStudies] = useState<SavedStudy[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudies = () => {
    if (user?.id) {
      fetchSavedStudies(user.id)
        .then((data) => setStudies(data))
        .catch(() => setStudies([]))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadStudies();
  }, [user?.id]);

  const handleRemove = async (id: string) => {
    setStudies(studies.filter((s) => s.id !== id));
    try {
      await deleteSavedStudy(id);
    } catch (err) {
      console.error("Failed to delete study:", err);
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Saved Studies Library & Bookmarks
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Peer-reviewed toxicology papers, clinical trials, and epidemiological cohorts bookmarked from your food audits
          </p>
        </div>

        <div className="space-y-4">
          {studies.map((study) => (
            <div
              key={study.id}
              className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 font-mono text-[11px] font-bold rounded">
                  {study.journal} • {study.year}
                </span>
                {study.doi && (
                  <span className="font-mono text-[11px] text-zinc-400">
                    DOI: {study.doi}
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-zinc-900 font-display leading-snug">
                {study.title}
              </h2>

              <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                {study.summary}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => handleRemove(study.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-rose-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">bookmark_remove</span>
                  <span>Remove Bookmark</span>
                </button>
                {study.doi && (
                  <a
                    href={`https://doi.org/${study.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>Read Full Paper on PubMed / Journal</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
