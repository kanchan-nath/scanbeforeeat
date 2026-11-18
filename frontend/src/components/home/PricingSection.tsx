import { pricingPlans } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";

export function PricingSection() {
  return (
    <section className="py-20 bg-zinc-50 border-b border-zinc-200" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="font-label text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Transparent Pricing • Zero Hidden Costs
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight font-headline mb-4">
            Simple, Honest Plans for Pure Food Clarity
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
            Start with 15 free scans every month. Upgrade when you need deep chemical cocktail alerts, PubMed citations, and high-frequency supermarket scanning.
          </p>
        </div>

        {/* 4-Card Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all duration-200 ${
                plan.highlight
                  ? "bg-white border-2 border-emerald-600 shadow-xl shadow-emerald-950/5 ring-4 ring-emerald-50"
                  : "bg-white border border-zinc-200 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Top Badge for Featured */}
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-label text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-zinc-950 font-headline">{plan.name}</h3>
                  {!plan.highlight && (
                    <span className="text-[11px] font-label font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-600 min-h-[36px] mb-6 leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-4 pb-4 border-b border-zinc-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-label">
                      {plan.price}
                    </span>
                    <span className="text-xs font-medium text-zinc-500">{plan.period}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{plan.subtext}</div>
                </div>

                {/* Quota Callout */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold w-full">
                    <Icon name="check_circle" className="text-sm text-emerald-600" />
                    <span>{plan.scans}</span>
                  </div>
                </div>

                {/* Feature List */}
                <ul className="space-y-3 mb-8 text-xs text-zinc-700">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Icon name="check" className="text-emerald-600 text-sm mt-0.5 shrink-0" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                <a
                  href={plan.ctaHref}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
                    plan.highlight
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <Icon name="arrow_forward" className="text-sm" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-500 flex items-center justify-center gap-2 flex-wrap font-medium">
            <Icon name="lock" className="text-emerald-600 text-sm" />
            <span>Zero corporate food lobby ads</span>
            <span className="text-zinc-300">•</span>
            <span>No recurring contracts on 6M/Annual</span>
            <span className="text-zinc-300">•</span>
            <span>Instant scan access without waiting</span>
          </p>
        </div>
      </div>
    </section>
  );
}
