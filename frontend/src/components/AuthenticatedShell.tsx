"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  name: string;
  shortName?: string;
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
      { name: "Dashboard", shortName: "Home", href: "/dashboard", icon: "grid_view" },
      { name: "Live Scanner", shortName: "Scanner", href: "/scanner", icon: "qr_code_scanner" },
      { name: "Batch Queue", shortName: "Queue", href: "/batch-queue", icon: "receipt_long" },
      { name: "Audit History", shortName: "History", href: "/history", icon: "history" },
    ],
  },
  {
    title: "PANTRY & GROCERY",
    items: [
      { name: "Digital Pantry", shortName: "Pantry", href: "/pantry", icon: "kitchen" },
      { name: "Product Duel", shortName: "Duel", href: "/duel", icon: "compare_arrows" },
      { name: "Clean Alternatives", shortName: "Alternatives", href: "/alternatives", icon: "eco" },
      { name: "Shopping List", shortName: "Grocery", href: "/shopping-list", icon: "shopping_cart" },
    ],
  },
  {
    title: "HEALTH & TOXICOLOGY",
    items: [
      { name: "Diet & Health", shortName: "Profile", href: "/health-profile", icon: "badge" },
      { name: "Allergen Matrix", shortName: "Allergens", href: "/allergens", icon: "warning" },
      { name: "Banned Additives", shortName: "Banned", href: "/banned-additives", icon: "block" },
      { name: "Exposure Ledger", shortName: "Exposure", href: "/exposure-ledger", icon: "monitoring" },
      { name: "Synergy Alerts", shortName: "Synergies", href: "/synergy-alerts", icon: "science" },
      { name: "Saved Studies", shortName: "Studies", href: "/saved-studies", icon: "bookmark" },
    ],
  },
  {
    title: "BILLING & PLANS",
    items: [
      { name: "Subscription Plans", shortName: "Plans", href: "/pricing", icon: "loyalty" },
      { name: "Manage Plan", shortName: "Billing", href: "/subscription", icon: "credit_card" },
      { name: "Payment Methods", shortName: "Payments", href: "/payment-methods", icon: "payments" },
      { name: "Invoices & Receipts", shortName: "Invoices", href: "/invoices", icon: "description" },
    ],
  },
  {
    title: "DEVELOPER API",
    items: [
      { name: "API Dashboard", shortName: "Developer", href: "/developer", icon: "terminal" },
      { name: "API Keys", shortName: "API Keys", href: "/api-keys", icon: "key" },
      { name: "Webhooks", shortName: "Webhooks", href: "/webhooks", icon: "webhook" },
      { name: "API Playground", shortName: "Playground", href: "/api-playground", icon: "play_circle" },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { name: "Security & 2FA", shortName: "Security", href: "/account/security", icon: "security" },
      { name: "Active Sessions", shortName: "Sessions", href: "/account/sessions", icon: "devices" },
      { name: "Notifications", shortName: "Alerts", href: "/account/notifications", icon: "notifications" },
      { name: "Family Profiles", shortName: "Family", href: "/account/family", icon: "group" },
      { name: "Data Export", shortName: "Export", href: "/account/export", icon: "cloud_download" },
      { name: "Delete Account", shortName: "Delete", href: "/account/delete", icon: "delete_forever" },
    ],
  },
];

// Flat list of mobile navigation items matching the reference design 1:1
const MOBILE_NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", shortName: "Home", href: "/dashboard", icon: "grid_view" },
  { name: "Live Scanner", shortName: "Scanner", href: "/scanner", icon: "qr_code_scanner" },
  { name: "Digital Pantry", shortName: "Pantry", href: "/pantry", icon: "kitchen" },
  { name: "Shopping List", shortName: "Grocery", href: "/shopping-list", icon: "shopping_cart" },
  { name: "Diet & Health", shortName: "Profile", href: "/health-profile", icon: "badge" },
  { name: "Product Duel", shortName: "Duel", href: "/duel", icon: "compare_arrows" },
  { name: "Clean Alternatives", shortName: "Alternatives", href: "/alternatives", icon: "eco" },
  { name: "Audit History", shortName: "History", href: "/history", icon: "history" },
  { name: "Batch Queue", shortName: "Queue", href: "/batch-queue", icon: "receipt_long" },
  { name: "Allergen Matrix", shortName: "Allergens", href: "/allergens", icon: "warning" },
  { name: "Banned Additives", shortName: "Banned", href: "/banned-additives", icon: "block" },
  { name: "Exposure Ledger", shortName: "Exposure", href: "/exposure-ledger", icon: "monitoring" },
  { name: "Synergy Alerts", shortName: "Synergies", href: "/synergy-alerts", icon: "science" },
  { name: "Saved Studies", shortName: "Studies", href: "/saved-studies", icon: "bookmark" },
  { name: "Subscription Plans", shortName: "Plans", href: "/pricing", icon: "loyalty" },
  { name: "Manage Plan", shortName: "Billing", href: "/subscription", icon: "credit_card" },
  { name: "Payment Methods", shortName: "Payments", href: "/payment-methods", icon: "payments" },
  { name: "Invoices & Receipts", shortName: "Invoices", href: "/invoices", icon: "description" },
  { name: "API Dashboard", shortName: "Developer", href: "/developer", icon: "terminal" },
  { name: "API Keys", shortName: "API Keys", href: "/api-keys", icon: "key" },
  { name: "Webhooks", shortName: "Webhooks", href: "/webhooks", icon: "webhook" },
  { name: "API Playground", shortName: "Playground", href: "/api-playground", icon: "play_circle" },
  { name: "Security & 2FA", shortName: "Security", href: "/account/security", icon: "security" },
  { name: "Active Sessions", shortName: "Sessions", href: "/account/sessions", icon: "devices" },
  { name: "Notifications", shortName: "Alerts", href: "/account/notifications", icon: "notifications" },
  { name: "Family Profiles", shortName: "Family", href: "/account/family", icon: "group" },
  { name: "Data Export", shortName: "Export", href: "/account/export", icon: "cloud_download" },
  { name: "Delete Account", shortName: "Delete", href: "/account/delete", icon: "delete_forever" },
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
  const railRef = useRef<HTMLDivElement>(null);

  // Smoothly center active item in horizontal scroll rail on mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeItem = railRef.current?.querySelector('[data-active="true"]');
      if (activeItem && typeof activeItem.scrollIntoView === "function") {
        activeItem.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

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

            {/* Notifications Bell - hidden on mobile, visible sm+ */}
            <Link
              href="/account/notifications"
              className="hidden sm:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 relative transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
            </Link>

            {/* Pro Plan / Free Plan Badge */}
            <Link
              href="/pricing"
              className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold tracking-wider transition-colors ${
                isPro
                  ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span className="hidden sm:inline">{isPro ? "PRO PLAN" : "FREE PLAN"}</span>
              <span className="sm:hidden">{isPro ? "PRO" : "FREE"}</span>
            </Link>

            {/* Profile Avatar */}
            <Link
              href="/health-profile"
              className="flex items-center gap-2 sm:pl-2 sm:pr-3 py-0.5 sm:py-1 rounded-full sm:border sm:border-zinc-200 hover:border-zinc-300 sm:bg-white shadow-xs transition-all group"
            >
              <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs sm:text-[10px] font-bold shrink-0">
                {initials}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-zinc-800 group-hover:text-zinc-950 truncate max-w-[120px]">
                {displayName}
              </span>
            </Link>
          </div>
        </header>

        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Matching Reference 1:1) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-stretch h-[60px]"
      >
        {/* Horizontally Slideable Navigation Rail */}
        <div
          ref={railRef}
          className="flex-1 flex items-center overflow-x-auto no-scrollbar scroll-smooth px-1.5 gap-0.5"
        >
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive ? "true" : "false"}
                className={`flex flex-col items-center justify-center shrink-0 min-w-[62px] h-full py-1 px-1.5 transition-colors group active:scale-95 ${
                  isActive ? "text-emerald-600 font-bold" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] leading-none mb-1 transition-transform group-active:scale-90 ${
                    isActive ? "text-emerald-600" : "text-zinc-500"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] tracking-tight truncate max-w-[62px] leading-none ${
                    isActive ? "text-emerald-600 font-bold" : "text-zinc-500 font-medium"
                  }`}
                >
                  {item.shortName || item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Pinned Bottom Hamburger Menu Button (Icon stacked above text) */}
        <button
          onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
          className={`flex flex-col items-center justify-center shrink-0 min-w-[62px] h-full px-2 py-1 border-l border-zinc-200/80 bg-white transition-colors group active:bg-zinc-50 ${
            bottomSheetOpen ? "text-emerald-600 font-bold" : "text-zinc-600 hover:text-zinc-950"
          }`}
          aria-label="Toggle full menu directory"
        >
          <span
            className={`material-symbols-outlined text-[22px] leading-none mb-1 transition-transform group-active:scale-90 ${
              bottomSheetOpen ? "text-emerald-600" : "text-zinc-700"
            }`}
          >
            {bottomSheetOpen ? "close" : "menu"}
          </span>
          <span
            className={`text-[10px] tracking-tight font-medium leading-none ${
              bottomSheetOpen ? "text-emerald-600 font-bold" : "text-zinc-700"
            }`}
          >
            Menu
          </span>
        </button>
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
              {NAV_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-2">
                  <div className="text-[11px] font-bold font-mono tracking-wider text-zinc-400 uppercase">
                    {section.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setBottomSheetOpen(false)}
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
