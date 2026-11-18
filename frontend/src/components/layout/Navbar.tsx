"use client";

import React, { useState } from "react";
import Link from "next/link";
import { siteConfig, navItems } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header
      id="main-nav"
      className="sticky top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link
          href="/"
          className="font-display text-base font-bold tracking-tight text-zinc-950 flex items-center gap-2.5 group transition-transform active:scale-[0.98]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={siteConfig.logoUrl}
            alt="ScanBeforeEat Logo"
            className="w-8 h-8 rounded-lg object-contain inline-block shrink-0 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="tracking-tight text-zinc-950 group-hover:text-emerald-700 transition-colors font-extrabold text-base">
            ScanBeforeEat
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-zinc-600 hover:text-emerald-700 transition-colors duration-150"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{user.remainingScans} Scans Left</span>
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-950 transition-colors duration-150"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <Link
              href="/auth"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-950 transition-colors duration-150"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/scanner"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-emerald-500/25 active:scale-[0.98] transition-all duration-150 gap-1.5"
          >
            <Icon name="qr_code_scanner" className="text-sm" />
            <span>Start Scanning</span>
          </Link>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/scanner"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs active:scale-95 transition-transform flex items-center gap-1"
          >
            <span>Scan Now</span>
            <Icon name="arrow_forward" className="text-xs" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
            className="p-1.5 text-zinc-700 hover:text-emerald-700 rounded-lg active:scale-95 transition-all cursor-pointer"
          >
            <Icon
              name={mobileMenuOpen ? "close" : "menu"}
              className="text-2xl"
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1 text-sm font-medium text-zinc-700">
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold flex items-center justify-between"
              >
                <span>Dashboard ({user.remainingScans} scans left)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              </Link>
            )}
            <Link
              href="/duel"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors text-emerald-700 font-medium"
            >
              Product Duel (Comparison)
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-medium text-zinc-700 hover:text-zinc-950"
              >
                Account Settings & History
              </Link>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-medium text-zinc-700 hover:text-zinc-950"
              >
                Sign In to Account
              </Link>
            )}
            <Link
              href="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center justify-center gap-1.5"
            >
              <Icon name="qr_code_scanner" className="text-sm" />
              <span>Start Free Scan (15 Included)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
