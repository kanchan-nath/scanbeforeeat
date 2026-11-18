"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, signInGoogle, loginDemo, user } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, show quick redirect option
  if (user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Icon name="verified" className="text-2xl" />
            </div>
            <h1 className="text-xl font-bold text-zinc-950 font-headline mb-2">
              Already Signed In
            </h1>
            <p className="text-sm text-zinc-600 mb-6">
              You are signed in as <strong>{user.email}</strong> with{" "}
              <span className="text-emerald-700 font-bold">{user.remainingScans} scans remaining</span>.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/scanner"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Icon name="qr_code_scanner" className="text-base" />
                <span>Go to Barcode Scanner</span>
              </Link>
              <Link
                href="/dashboard"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <span>View Dashboard & Quota</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await signInGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign in was interrupted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = async (plan: "free" | "monthly_pro") => {
    setIsSubmitting(true);
    try {
      await loginDemo(plan);
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 relative overflow-x-hidden pt-12 pb-20">
        {/* Ambient emerald aura glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/40 via-emerald-50/20 to-transparent pointer-events-none -z-10 blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Brand Trust & Feature Showcase */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-5 w-fit shadow-xs font-label">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Secure Account Access // 256-Bit Encryption</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 font-headline">
                Your Personal Food Toxicology Command Center
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                Sign in to access your scanned product history, set personalized dietary & allergen watchlists, and unlock high-speed barcode inspection.
              </p>

              {/* 3 Value Propositions */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/80">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <Icon name="fact_check" className="text-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 font-headline">
                      Personalized Allergen & E-Number Watchlists
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                      Flag specific gums, artificial dyes, seed oils, or preservatives tailored to your family.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/80">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <Icon name="sync" className="text-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 font-headline">
                      Cross-Device Scan Synchronization
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                      Seamlessly sync scans between web and mobile camera apps with instant cloud backup.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/80">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <Icon name="shield" className="text-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 font-headline">
                      Zero-Data Monetization Guarantee
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                      100% user supported. No corporate food lobby sponsors, no ads, no trackers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Clinical Testimonial */}
              <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md tracking-wider font-label border border-emerald-200/50">
                    <Icon name="verified" className="text-xs text-emerald-700" />
                    <span>CLINICAL USER VERIFIED</span>
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed mb-3">
                  &ldquo;ScanBeforeEat caught emulsifiers that triggered my Crohn&apos;s flares before I bought the dressing. An indispensable daily diagnostic tool.&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 font-label font-bold text-xs flex items-center justify-center shrink-0">
                    MV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-headline leading-tight">Dr. Marcus Vance, MD</p>
                    <p className="text-[11px] text-slate-500 font-medium">Gastroenterology & Clinical Nutrition Fellow</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Sign In / Sign Up Form */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-9 relative">
                {/* Mode Selector Tabs */}
                <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setMode("signin"); setErrorMsg(""); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      mode === "signin"
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setErrorMsg(""); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      mode === "signup"
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    Create Free Account
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-headline">
                    {mode === "signin" ? "Sign in to ScanBeforeEat" : "Claim 15 Free Monthly Scans"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {mode === "signin"
                      ? "Enter your credentials or choose a quick login below"
                      : "Create your free account. No credit card required."}
                  </p>
                </div>

                {/* Google SSO Button */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={isSubmitting}
                  className="w-full border border-slate-200 rounded-xl py-2.5 px-3 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer active:scale-[0.99] mb-4"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Instant Showcase Demo Access */}
                <div className="mb-6 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleDemo("monthly_pro")}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Icon name="verified_user" className="text-sm text-emerald-700" />
                    <span>Explore Showcase Demo (<code className="text-emerald-800 font-mono">trial@scanbeforeeat.com</code>)</span>
                  </button>
                  <p className="text-[11px] text-zinc-500 text-center">
                    Showcases full product components with pre-loaded mock food audits, pantry, and invoices
                  </p>
                </div>

                <div className="relative flex items-center justify-center my-6">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-3 text-[10px] font-semibold text-slate-400 tracking-wider uppercase font-label shrink-0">
                    OR SIGN IN WITH YOUR PERSONAL ACCOUNT
                  </span>
                  <div className="border-t border-slate-200 w-full"></div>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <Icon name="warning" className="text-sm shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="name">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Dr. Alex Rivera"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700" htmlFor="email">
                        Email Address
                      </label>
                      <button
                        type="button"
                        onClick={() => setEmail("trial@scanbeforeeat.com")}
                        className="text-[10px] text-emerald-700 hover:underline font-medium"
                      >
                        Auto-fill Showcase Trial
                      </button>
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.rivera@example.com or trial@scanbeforeeat.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? "Connecting..." : mode === "signin" ? "Sign In" : "Create Account & Start Scanning"}</span>
                    <Icon name="arrow_forward" className="text-sm" />
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                  Protected by 256-bit encryption. By continuing you agree to our{" "}
                  <Link href="/terms" className="text-emerald-700 hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-emerald-700 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
