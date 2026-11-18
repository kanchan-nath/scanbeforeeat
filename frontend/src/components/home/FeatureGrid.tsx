import { Icon } from "@/components/ui/Icon";

export function FeatureGrid() {
  const features = [
    {
      icon: "barcode_scanner",
      title: "Instant Barcode Scanner",
      description:
        "Real-time live camera scanning supporting UPC, EAN-13, and QR codes across 2M+ global products with zero lag.",
      metric: "<180ms",
      status: "Active",
    },
    {
      icon: "document_scanner",
      title: "OCR Text & Label Reader",
      description:
        "Photograph any physical ingredient list or paste unformatted text from obscure import labels with multilingual NLP support.",
      metric: "MULTILINGUAL_OCR",
      status: "Active",
    },
    {
      icon: "biotech",
      title: "AI Chemical & E-Number Engine",
      description:
        "Granular breakdown for every single additive, hidden sugars, synthetic gums, and chemical emulsifiers against toxicological bounds.",
      metric: "EFSA_PARSER_V3",
      status: "Active",
    },
    {
      icon: "notification_important",
      title: "Personalized Allergen Alerts",
      description:
        "Configure custom profiles for Celiac, lactose intolerance, nuts, seed oils, sulfites, or artificial dyes with zero false positives.",
      metric: "ZERO_TOLERANCE",
      status: "Active",
    },
    {
      icon: "compare_arrows",
      title: "Side-by-Side Product Duel",
      description:
        "Head-to-head nutritional and processing duel between 2-3 grocery alternatives to choose the cleanest option effortlessly.",
      metric: "DELTA_RANKING",
      status: "Active",
    },
    {
      icon: "fact_check",
      title: "NOVA & Nutri-Score System",
      description:
        "Independent scientific processing classification (NOVA 1-4) combined with calibrated European Nutri-Score standards.",
      metric: "UN_FAO_STANDARDS",
      status: "Active",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white border-b border-zinc-200" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-10 md:mb-14">
          <div className="font-label text-xs uppercase tracking-widest text-emerald-700 font-bold mb-2">
            Engineered Precision
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-950 tracking-tight font-headline">
            Features Built for Pure Food Transparency
          </h2>
          <p className="text-zinc-600 mt-2 text-sm sm:text-base">
            We removed marketing hype to give you direct scientific insight into packaged consumer goods.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50 transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200">
                  <Icon name={feat.icon} className="text-xl" />
                </div>
                <h3 className="font-label text-base font-bold text-zinc-950 mb-2">
                  {feat.title}
                </h3>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-label text-zinc-400">
                <span>{feat.metric}</span>
                <span className="text-emerald-700 font-semibold">{feat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
