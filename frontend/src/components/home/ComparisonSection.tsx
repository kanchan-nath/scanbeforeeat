import { Icon } from "@/components/ui/Icon";

export function ComparisonSection() {
  const tableRows = [
    {
      criteria: "Transparent Score Breakdown",
      sbe: "Full scientific formula shown",
      yuka: "Proprietary algorithm / partial",
      generic: "Vague high-level score",
      sbeCheck: true,
      genericCheck: false,
    },
    {
      criteria: "Per-Ingredient Evidence",
      sbe: "Direct PubMed & EFSA citations",
      yuka: "General hazard rating",
      generic: "None / static labels",
      sbeCheck: true,
      genericCheck: false,
    },
    {
      criteria: "Ultra-Processed (NOVA) Detection",
      sbe: "All 4 NOVA tiers categorized",
      yuka: "Limited / Nutri-Score only",
      generic: "Basic calorie counter",
      sbeCheck: true,
      genericCheck: false,
    },
    {
      criteria: "Corporate Food Lobby Independence",
      sbe: "Zero food lobby funding",
      yuka: "Independent",
      generic: "Sponsored brand search ads",
      sbeCheck: true,
      genericCheck: false,
    },
    {
      criteria: "Free Deep Scans to Start",
      sbe: "15 free detailed scans, no credit card",
      yuka: "Freemium with locked features",
      generic: "Forced paywall / ad blitz",
      sbeCheck: true,
      genericCheck: false,
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200" id="comparison">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-10 md:mb-12">
          <div className="font-label text-xs uppercase tracking-widest text-emerald-700 font-bold mb-2">
            Uncompromising Standard
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-950 tracking-tight font-headline">
            Why ScanBeforeEat?
          </h2>
          <p className="text-zinc-600 mt-2 text-sm sm:text-base">
            Independent scientific rigor vs sponsored nutrition apps.
          </p>
        </div>

        {/* === MOBILE STACKED CARDS (block md:hidden) === */}
        <div className="flex md:hidden flex-col gap-3">
          {/* ScanBeforeEat Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-500 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Icon name="verified" className="text-emerald-700 text-xl" />
                <span className="font-bold text-sm text-emerald-950 font-display">ScanBeforeEat</span>
              </div>
              <span className="text-[10px] font-mono-code font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                CLINICAL
              </span>
            </div>
            <ul className="flex flex-col gap-2 text-xs text-emerald-900">
              <li className="flex items-start gap-2">
                <Icon name="check" className="text-emerald-600 text-sm mt-0.5" />
                <span>
                  <strong>100% Transparent Formula:</strong> Every formula weight, nutrient ceiling, and risk factor is open-source.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" className="text-emerald-600 text-sm mt-0.5" />
                <span>
                  <strong>PubMed & EFSA Citations:</strong> Direct clickable links to medical studies on each additive.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" className="text-emerald-600 text-sm mt-0.5" />
                <span>
                  <strong>Full NOVA 1-4 Tiering:</strong> Detects industrial processing tricks regardless of clean marketing claims.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" className="text-emerald-600 text-sm mt-0.5" />
                <span>
                  <strong>Zero Corporate Dollars:</strong> No paid brand promotions or hidden affiliate recommendation deals.
                </span>
              </li>
            </ul>
          </div>

          {/* Generic Apps Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2.5 opacity-90">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Icon name="cancel" className="text-slate-500 text-xl" />
                <span className="font-bold text-sm text-slate-800 font-display">Generic Apps (Yuka, etc.)</span>
              </div>
              <span className="text-[10px] font-mono-code bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                LEGACY
              </span>
            </div>
            <ul className="flex flex-col gap-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Icon name="close" className="text-slate-400 text-sm mt-0.5" />
                <span>Proprietary closed algorithm without deduction math</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="close" className="text-slate-400 text-sm mt-0.5" />
                <span>Basic hazard ratings with zero linked academic trials</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="close" className="text-slate-400 text-sm mt-0.5" />
                <span>Aggressive upsell paywalls or sponsored product placements</span>
              </li>
            </ul>
          </div>
        </div>

        {/* === DESKTOP TABLE VIEW (hidden md:block) === */}
        <div className="hidden md:block bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-100/80 font-label text-xs text-zinc-700">
                <th className="py-4 px-6 font-bold w-1/4">Criteria</th>
                <th className="py-4 px-6 font-bold text-emerald-800 bg-emerald-50/70 border-x border-emerald-100 w-1/3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>ScanBeforeEat</span>
                  </div>
                </th>
                <th className="py-4 px-6 font-semibold text-zinc-600 w-1/5">Yuka</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 w-1/5">Generic Apps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-body text-xs sm:text-sm">
              {tableRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50">
                  <td className="py-4 px-6 font-semibold text-zinc-900">{row.criteria}</td>
                  <td className="py-4 px-6 text-emerald-950 font-medium bg-emerald-50/30 border-x border-emerald-100">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <Icon name="check" className="text-sm" />
                      <span>{row.sbe}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-zinc-600">{row.yuka}</td>
                  <td className="py-4 px-6 text-zinc-400">
                    <span className="inline-flex items-center gap-1 text-rose-600">
                      <Icon name="close" className="text-sm" />
                      <span>{row.generic}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
