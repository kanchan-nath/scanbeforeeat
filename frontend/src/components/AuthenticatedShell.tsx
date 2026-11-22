"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "CORE AUDIT",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { name: "Live Scanner", href: "/scanner", icon: "qr_code_scanner" },
      { name: "Batch Queue", href: "/batch-queue", icon: "receipt_long" },
      { name: "Audit History", href: "/history", icon: "history" },
    ],
  },
  {
    title: "PANTRY & GROCERY",
    items: [
      { name: "Digital Pantry", href: "/pantry", icon: "kitchen" },
      { name: "Product Duel", href: "/duel", icon: "compare_arrows" },
      { name: "Clean Alternatives", href: "/alternatives", icon: "eco" },
      { name: "Shopping List", href: "/shopping-list", icon: "shopping_cart" },
    ],
  },
  {
    title: "HEALTH & TOXICOLOGY",
    items: [
      { name: "Diet & Health", href: "/health-profile", icon: "badge" },
      { name: "Allergen Matrix", href: "/allergens", icon: "warning" },
      { name: "Banned Additives", href: "/banned-additives", icon: "block" },
      { name: "Exposure Ledger", href: "/exposure-ledger", icon: "monitoring" },
      { name: "Synergy Alerts", href: "/synergy-alerts", icon: "science" },
      { name: "Saved Studies", href: "/saved-studies", icon: "bookmark" },
    ],
  },
  {
    title: "BILLING & PLANS",
    items: [
      { name: "Subscription Plans", href: "/pricing", icon: "loyalty" },
      { name: "Manage Plan", href: "/subscription", icon: "credit_card" },
      { name: "Payment Methods", href: "/payment-methods", icon: "payments" },
      { name: "Invoices & Receipts", href: "/invoices", icon: "description" },
    ],
  },
  {
    title: "DEVELOPER API",
    items: [
      { name: "API Dashboard", href: "/developer", icon: "terminal" },
      { name: "API Keys", href: "/api-keys", icon: "key" },
      { name: "Webhooks", href: "/webhooks", icon: "webhook" },
      { name: "API Playground", href: "/api-playground", icon: "play_circle" },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { name: "Security & 2FA", href: "/account/security", icon: "security" },
      { name: "Active Sessions", href: "/account/sessions", icon: "devices" },
      { name: "Notifications", href: "/account/notifications", icon: "notifications" },
      { name: "Family Profiles", href: "/account/family", icon: "group" },
      { name: "Data Export", href: "/account/export", icon: "cloud_download" },
      { name: "Delete Account", href: "/account/delete", icon: "delete_forever" },
    ],
  },
];

const SEARCH_CATALOG = [
  { title: "Maggi 2-Minute Masala Noodles", subtitle: "UPC: 8901058852331 • Score: 38 (NOVA 4)", href: "/product/8901058852331", type: "Product" },
  { title: "Barista Edition Oat Milk (Oatly)", subtitle: "UPC: 7394376616037 • Score: 72 (NOVA 3)", href: "/product/7394376616037", type: "Product" },
  { title: "Himalayan Pink Gold Organic Popcorn", subtitle: "UPC: 0855238004128 • Score: 86 (NOVA 1)", href: "/product/0855238004128", type: "Product" },
  { title: "Tartrazine (E102 / Yellow 5)", subtitle: "Synthetic Azo Dye • High Pediatric Risk", href: "/additives", type: "Additive" },
  { title: "TBHQ (Tertiary Butylhydroquinone / E319)", subtitle: "Synthetic Preservative • High Risk", href: "/banned-additives", type: "Additive" },
  { title: "Sodium Benzoate (E211)", subtitle: "Preservative • Vitamin C Synergy Alert", href: "/synergy-alerts", type: "Additive" },
  { title: "Digital Pantry Inventory", subtitle: "4 items cataloged • Expiry tracking", href: "/pantry", type: "Page" },
  { title: "Smart Grocery Shopping List", subtitle: "Clean items & pantry replenishment", href: "/shopping-list", type: "Page" },
  { title: "Personal Toxicological Exposure Ledger", subtitle: "Cumulative additive bio-burden tracker", href: "/exposure-ledger", type: "Page" },
  { title: "Allergen Matrix Manager", subtitle: "Configure strict exclusion parameters", href: "/allergens", type: "Page" },
];

export default function AuthenticatedShell({
  children,
  headerAction,
}: {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sectionTabsRef = useRef<HTMLDivElement>(null);
  const itemsRailRef = useRef<HTMLDivElement>(null);

  // Sync active section based on current pathname
  const currentSectionIdx = NAV_SECTIONS.findIndex((section) =>
    section.items.some((item) => item.href === pathname)
  );
  const [activeSectionIdx, setActiveSectionIdx] = useState(
    currentSectionIdx >= 0 ? currentSectionIdx : 0
  );

  useEffect(() => {
    const idx = NAV_SECTIONS.findIndex((section) =>
      section.items.some((item) => item.href === pathname)
    );
    if (idx >= 0) {
      setActiveSectionIdx(idx);
    }
  }, [pathname]);

  // Smoothly center active tab & active item in horizontal scroll rails
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeTab = sectionTabsRef.current?.querySelector('[data-active="true"]');
      if (activeTab && typeof activeTab.scrollIntoView === "function") {
        activeTab.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
      }
      const activeItem = itemsRailRef.current?.querySelector('[data-active="true"]');
      if (activeItem && typeof activeItem.scrollIntoView === "function") {
        activeItem.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname, activeSectionIdx]);

  // Keyboard shortcut: Cmd+K or Ctrl+K focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute avatar initials and display name
  const displayName = user?.displayName || (user?.email ? user.email.split("@")[0] : "Dr. Elena Vance");
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isPro = user?.plan && user.plan !== "free";

  const searchResults = searchQuery.trim().length > 0
    ? SEARCH_CATALOG.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      router.push(searchResults[0].href);
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header Bar - Hamburger/Breadcrumb button removed */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
            SE
          </div>
          <span className="font-bold text-base tracking-tight text-zinc-900 font-display">
            ScanBeforeEat
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Mobile Plan Badge */}
          <Link
            href="/pricing"
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
              isPro ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            {isPro ? "PRO" : "FREE"}
          </Link>

          {/* Profile link */}
          <Link
            href="/health-profile"
            className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold"
          >
            {initials}
          </Link>

          {headerAction}
        </div>
      </header>



      {/* Desktop Fixed Side Navigation Bar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-zinc-200 bg-white z-50 flex-col justify-between p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs group-hover:scale-105 transition-transform">
              SE
            </div>
            <div>
              <span className="font-display font-bold text-base text-zinc-900 tracking-tight block">
                ScanBeforeEat
              </span>
              <div className="text-[10px] font-mono font-medium text-emerald-600 -mt-1 tracking-wider uppercase">
                {isPro ? "Pro Toxicologist" : "Free Trial (15 Scans)"}
              </div>
            </div>
          </Link>

          {/* Navigation Menu */}
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 text-[10px] font-bold font-mono tracking-wider text-zinc-400 uppercase mb-1">
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors duration-150 font-medium ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 font-semibold shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-base shrink-0 ${isActive ? "text-emerald-700" : "text-zinc-400"}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-auto shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile Card */}
        <div className="pt-4 border-t border-zinc-200 mt-6">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors">
            <Link href="/health-profile" className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-zinc-900 truncate">{displayName}</div>
                <div className="text-[10px] text-zinc-500 truncate">{user?.email || "elena@science.org"}</div>
              </div>
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.push("/auth");
              }}
              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen bg-slate-50 flex flex-col pb-28 md:pb-6">
        {/* Desktop Authenticated Top Bar (Matching Stitch 1:1) */}
        <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-zinc-200 px-6 py-3 hidden md:flex items-center justify-between shadow-xs">
          {/* Search Bar with ⌘K keyboard shortcut */}
          <div className="relative max-w-md w-full">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs text-zinc-500 focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-base text-zinc-400">search</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-hidden w-full text-xs text-zinc-900 placeholder-zinc-400"
                placeholder="Search additives, E-numbers, products..."
              />
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-zinc-200 text-zinc-400 shadow-xs">
                ⌘K
              </kbd>
            </form>

            {/* Instant Search Dropdown Results */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg p-2 z-50 divide-y divide-zinc-100 max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs text-zinc-400">
                    No matching additives or products found.
                  </div>
                ) : (
                  searchResults.map((res, i) => (
                    <Link
                      key={i}
                      href={res.href}
                      onClick={() => setSearchQuery("")}
                      className="p-2.5 flex items-center justify-between hover:bg-zinc-50 rounded-lg transition-colors group"
                    >
                      <div>
                        <div className="font-semibold text-xs text-zinc-900 group-hover:text-emerald-700">
                          {res.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{res.subtitle}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-mono shrink-0">
                        {res.type}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick Actions, Notifications, Plan Badge, and Profile */}
          <div className="flex items-center gap-3">
            {/* New Scan CTA */}
            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>New Scan</span>
            </Link>

            {/* Notifications Bell */}
            <Link
              href="/account/notifications"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 relative transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
            </Link>

            {/* Pro Plan / Free Plan Badge */}
            <Link
              href="/pricing"
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider transition-colors ${
                isPro
                  ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {isPro ? "PRO PLAN" : "FREE PLAN"}
            </Link>

            {/* Profile Avatar Pill */}
            <Link
              href="/health-profile"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-zinc-200 hover:border-zinc-300 bg-white shadow-xs transition-all group"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {initials}
              </div>
              <span className="text-xs font-semibold text-zinc-800 group-hover:text-zinc-950 truncate max-w-[120px]">
                {displayName}
              </span>
            </Link>
          </div>
        </header>

        {children}
      </main>

      {/* Mobile Slideable Bottom Navigation */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-lg"
      >
        {/* Row 1: Section Sliding Tabs */}
        <div
          ref={sectionTabsRef}
          className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar border-b border-zinc-100 scroll-smooth"
        >
          {NAV_SECTIONS.map((section, idx) => {
            const isSelected = activeSectionIdx === idx;
            const containsCurrentPage = section.items.some((i) => i.href === pathname);
            return (
              <button
                key={section.title}
                data-active={isSelected ? "true" : "false"}
                onClick={() => setActiveSectionIdx(idx)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white font-bold shadow-xs scale-102"
                    : containsCurrentPage
                    ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200"
                    : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                }`}
              >
                {section.title}
              </button>
            );
          })}
          {/* Quick "ALL (24)" Bottom Sheet Expander */}
          <button
            onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
            className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider whitespace-nowrap shrink-0 bg-zinc-800 text-white font-bold flex items-center gap-1 active:scale-95 transition-transform"
            aria-label="All navigation links"
          >
            <span className="material-symbols-outlined text-xs">
              {bottomSheetOpen ? "expand_more" : "grid_view"}
            </span>
            <span>ALL (24)</span>
          </button>
        </div>

        {/* Row 2: Navigation Items (Horizontally Slideable) */}
        <div
          ref={itemsRailRef}
          className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {/* Previous section shortcut */}
          {activeSectionIdx > 0 && (
            <button
              onClick={() => setActiveSectionIdx(activeSectionIdx - 1)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-mono text-zinc-500 bg-zinc-100 border border-zinc-200 shrink-0 hover:bg-zinc-200 active:scale-95 transition-all"
              title={`Previous: ${NAV_SECTIONS[activeSectionIdx - 1].title}`}
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              <span>Prev</span>
            </button>
          )}

          {NAV_SECTIONS[activeSectionIdx]?.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive ? "true" : "false"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                  isActive
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-base ${
                    isActive ? "text-white" : "text-emerald-700"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5 shrink-0" />
                )}
              </Link>
            );
          })}

          {/* Next section shortcut */}
          {activeSectionIdx < NAV_SECTIONS.length - 1 && (
            <button
              onClick={() => setActiveSectionIdx(activeSectionIdx + 1)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-mono text-zinc-500 bg-zinc-100 border border-zinc-200 shrink-0 hover:bg-zinc-200 active:scale-95 transition-all"
              title={`Next: ${NAV_SECTIONS[activeSectionIdx + 1].title}`}
            >
              <span>Next</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          )}
        </div>
      </nav>

      {/* Slide-Up Bottom Sheet for Full Directory (Slides up from bottom) */}
      {bottomSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          {/* Backdrop dismiss */}
          <div className="flex-1" onClick={() => setBottomSheetOpen(false)} />

          {/* Bottom Sheet Card */}
          <div className="bg-white rounded-t-2xl max-h-[82vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle & Header */}
            <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/90">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  SE
                </div>
                <div>
                  <span className="font-bold text-sm text-zinc-900 block font-display">
                    ScanBeforeEat Navigation
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    All 6 Sections • 24 Pages
                  </span>
                </div>
              </div>
              <button
                onClick={() => setBottomSheetOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
                aria-label="Close navigation sheet"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Scrollable Directory Content */}
            <div className="overflow-y-auto p-4 space-y-5">
              {NAV_SECTIONS.map((section, sIdx) => (
                <div key={section.title} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      {section.title}
                    </span>
                    <button
                      onClick={() => {
                        setActiveSectionIdx(sIdx);
                        setBottomSheetOpen(false);
                      }}
                      className="text-[10px] font-medium text-emerald-600 hover:underline"
                    >
                      Focus Rail
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            setActiveSectionIdx(sIdx);
                            setBottomSheetOpen(false);
                          }}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors font-medium border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold"
                              : "bg-zinc-50/50 text-zinc-700 border-zinc-200/80 hover:bg-zinc-100"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-base shrink-0 ${
                              isActive ? "text-emerald-700" : "text-zinc-500"
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* User Account & Logout in Sheet */}
              <div className="pt-3 border-t border-zinc-200">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-zinc-900 truncate">
                        {displayName}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {user?.email || "elena@science.org"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setBottomSheetOpen(false);
                      await logout();
                      router.push("/auth");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 font-medium hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                    title="Sign Out"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
