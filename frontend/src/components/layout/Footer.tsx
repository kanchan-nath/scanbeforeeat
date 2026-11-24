"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { siteConfig } from "@/lib/config";

export function Footer() {
  const router = useRouter();
  const { user } = useAuth();

  const handleScanClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/scanner");
    } else {
      router.push("/auth?redirect=/scanner");
    }
  };
  return (
    <footer className="w-full bg-zinc-50 border-t border-zinc-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-display text-sm font-semibold tracking-tight text-zinc-950 flex items-center gap-2 mb-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={siteConfig.logoUrl}
                alt="ScanBeforeEat Logo"
                className="w-8 h-8 rounded-lg object-contain inline-block shrink-0"
              />
              <span className="font-bold text-base text-zinc-950">
                ScanBeforeEat
              </span>
            </Link>
            <p className="text-zinc-600 text-xs sm:text-sm max-w-sm mb-4 leading-relaxed font-body">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono-code font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>ENGINE_VERSION // {siteConfig.engineVersion}</span>
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col space-y-2.5 text-xs">
            <h4 className="font-label font-bold uppercase tracking-wider text-zinc-900 text-[11px]">
              Product
            </h4>
            <Link
              href="/scanner"
              onClick={handleScanClick}
              className="text-zinc-600 hover:text-emerald-700 transition-colors"
            >
              Scanner App
            </Link>
            <Link href="/additives" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              Ingredient Database
            </Link>
            <Link href="/methodology" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              Methodology
            </Link>
            <Link href="/upf-guide" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              UPF Guide (NOVA)
            </Link>
            <Link href="/api-docs" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              API Docs
            </Link>
          </div>

          {/* Resources Links */}
          <div className="flex flex-col space-y-2.5 text-xs">
            <h4 className="font-label font-bold uppercase tracking-wider text-zinc-900 text-[11px]">
              Resources
            </h4>
            <Link href="/studies" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              Studies & Papers
            </Link>
            <Link href="/blog" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              Research Blog
            </Link>
            <Link href="/about" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              About Us & Mission
            </Link>
            <Link href="/careers" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              Careers
            </Link>
            <Link href="/status" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              System Status
            </Link>
          </div>

          {/* Legal & Trust */}
          <div className="flex flex-col space-y-2.5 text-xs">
            <h4 className="font-label font-bold uppercase tracking-wider text-zinc-900 text-[11px]">
              Legal & Trust
            </h4>
            <Link href="/privacy" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              Terms of Service
            </Link>
            <Link href="/security" className="text-zinc-600 hover:text-emerald-700 transition-colors">
              Security Architecture
            </Link>
          </div>
        </div>

        {/* Medical & Scientific Scope Disclaimer */}
        <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200/80 mb-8">
          <p className="text-[11px] text-zinc-600 leading-relaxed font-body">
            <strong>Medical Disclaimer:</strong> ScanBeforeEat provides algorithmic analysis based on published nutritional literature, toxicology databases, and food packaging declarations. It does not constitute medical advice or individual diagnosis. Always review physical product labels and consult a qualified medical professional for health choices.
          </p>
        </div>

        {/* Copyright & Sub-bar */}
        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div>
            © 2025 ScanBeforeEat Inc. All rights reserved. Not Medical Advice.
          </div>
          <div className="flex items-center gap-4 font-label text-[11px]">
            <span>15 Free Scans / Month</span>
            <span>•</span>
            <span>GDPR Compliant</span>
            <span>•</span>
            <span>Zero Tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
