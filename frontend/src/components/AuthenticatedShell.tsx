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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      {/* Mobile Top Header Bar */}
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
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex">
          <div className="w-72 max-w-[85%] bg-white h-full flex flex-col justify-between p-4 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    SE
                  </div>
                  <span className="font-bold text-sm text-zinc-900">ScanBeforeEat</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-900"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {NAV_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  <div className="px-2 text-[10px] font-bold font-mono tracking-wider text-zinc-400 uppercase">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors duration-150 font-medium ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 font-semibold"
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                        }`}
                      >
                        <span className={`material-symbols-outlined text-base ${isActive ? "text-emerald-700" : "text-zinc-500"}`}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-200 mt-6">
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-zinc-900 truncate">{displayName}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{user?.email || "elena@science.org"}</div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    router.push("/auth");
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded transition-colors"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

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
      <main className="flex-1 md:ml-64 min-h-screen bg-slate-50 flex flex-col">
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

      {/* Mobile Bottom Thumb Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 px-4 py-2 flex items-center justify-around">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            pathname === "/dashboard" ? "text-emerald-600 font-bold" : "text-zinc-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">dashboard</span>
          <span>Home</span>
        </Link>
        <Link
          href="/scanner"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            pathname === "/scanner" ? "text-emerald-600 font-bold" : "text-zinc-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
          <span>Scanner</span>
        </Link>
        <Link
          href="/pantry"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            pathname === "/pantry" ? "text-emerald-600 font-bold" : "text-zinc-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">kitchen</span>
          <span>Pantry</span>
        </Link>
        <Link
          href="/shopping-list"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            pathname === "/shopping-list" ? "text-emerald-600 font-bold" : "text-zinc-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">shopping_cart</span>
          <span>Grocery</span>
        </Link>
        <Link
          href="/health-profile"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
            pathname === "/health-profile" ? "text-emerald-600 font-bold" : "text-zinc-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">badge</span>
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
