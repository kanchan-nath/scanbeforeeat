"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTarget = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
    ? redirectParam
    : "/dashboard";
  const { signInGoogle, signInTwitter, signInGithub, sendOtp, verifyOtp, loginDemo, user } = useAuth();

  // "signin" | "signup"
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  // Step 1: "email" | Step 2: "otp"
  const [step, setStep] = useState<"email" | "otp">("email");

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP State: 6 digits
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Refs for 6 OTP input boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // If already logged in, auto-redirect or show quick redirect option
  useEffect(() => {
    if (user) {
      router.replace(redirectTarget);
    }
  }, [user, redirectTarget, router]);

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
                href={redirectTarget}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Icon name="arrow_forward" className="text-base" />
                <span>Continue to {redirectTarget === "/scanner" ? "Scanner" : "Dashboard"}</span>
              </Link>
              {redirectTarget !== "/dashboard" && (
                <Link
                  href="/dashboard"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-all flex items-center justify-center gap-2"
                >
                  <span>View Dashboard & Quota</span>
                </Link>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Handle Send OTP (Step 1 -> Step 2)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const res = await sendOtp(email.trim());
      setSuccessMsg(`Verification code sent to ${email.trim()}`);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      setResendTimer(60);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send verification code. Please check your network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isSubmitting) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const res = await sendOtp(email.trim());
      setSuccessMsg(`New verification code sent to ${email.trim()}`);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      setResendTimer(60);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Verify OTP (Step 2)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await verifyOtp(email.trim(), fullOtp, displayName.trim() || undefined);
      router.push(redirectTarget);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired code. Please verify and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    // Handle pasted sequence
    if (clean.length > 1) {
      const pasteArray = clean.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        if (pasteArray[i]) {
          newDigits[i] = pasteArray[i];
        }
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasteArray.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const singleDigit = clean.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    // Auto advance focus
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Google SSO via Firebase Auth
  const handleGoogle = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await signInGoogle();
      router.push(redirectTarget);
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign in was interrupted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Twitter / X SSO via Firebase Auth
  const handleTwitter = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await signInTwitter();
      router.push(redirectTarget);
    } catch (err: any) {
      setErrorMsg(err.message || "X (Twitter) sign in was interrupted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // GitHub SSO via Firebase Auth
  const handleGithub = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await signInGithub();
      router.push(redirectTarget);
    } catch (err: any) {
      setErrorMsg(err.message || "GitHub sign in was interrupted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant Showcase Demo Login
  const handleDemo = async (plan: "free" | "monthly_pro") => {
    setIsSubmitting(true);
    try {
      await loginDemo(plan);
      router.push(redirectTarget);
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
                Sign in with Google or your email OTP to access your scanned product history, set personalized dietary & allergen watchlists, and unlock high-speed barcode inspection.
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

            {/* Right Column: Authentication Card (Step 1: Auth Options / Step 2: In-Page OTP Verification Section) */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-9 relative transition-all duration-300">
                {step === "email" ? (
                  /* ========================================================================= */
                  /* STEP 1: Main Authentication Section (Google + Email OTP trigger)          */
                  /* ========================================================================= */
                  <div>
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
                          ? "Continue with Google or receive a one-time login code to your email"
                          : "Create your free account via email OTP. No password required."}
                      </p>
                    </div>

                    {/* Google SSO Button (Firebase Auth) */}
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={isSubmitting}
                      className="w-full border border-slate-200 rounded-xl py-2.5 px-3 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer active:scale-[0.99] mb-2"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {/* Additional Social Providers: Twitter/X & GitHub */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={handleTwitter}
                        disabled={isSubmitting}
                        className="border border-slate-200 rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0 fill-current text-slate-900" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>X / Twitter</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGithub}
                        disabled={isSubmitting}
                        className="border border-slate-200 rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0 fill-current text-slate-900" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        <span>GitHub</span>
                      </button>
                    </div>

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
                    </div>

                    <div className="relative flex items-center justify-center my-6">
                      <div className="border-t border-slate-200 w-full"></div>
                      <span className="bg-white px-3 text-[10px] font-semibold text-slate-400 tracking-wider uppercase font-label shrink-0">
                        OR CONTINUE WITH EMAIL OTP
                      </span>
                      <div className="border-t border-slate-200 w-full"></div>
                    </div>

                    {errorMsg && (
                      <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <Icon name="warning" className="text-sm shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      {mode === "signup" && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="name">
                            Full Name
                          </label>
                          <input
                            id="name"
                            type="text"
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
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex.rivera@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        <span>{isSubmitting ? "Sending Code..." : "Send 6-Digit Verification Code"}</span>
                        <Icon name="mail" className="text-sm" />
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
                ) : (
                  /* ========================================================================= */
                  /* STEP 2: In-Page Secondary View - OTP Verification Section                 */
                  /* (Replaces the main auth form using the exact ScanBeforeEat color template) */
                  /* ========================================================================= */
                  <div>
                    {/* Header badge */}
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
                        <Icon name="mark_email_read" className="text-2xl" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-headline">
                        Enter Verification Code
                      </h2>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        We sent a 6-digit one-time code to{" "}
                        <strong className="text-slate-900 font-semibold">{email}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => { setStep("email"); setErrorMsg(""); setSuccessMsg(""); }}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold mt-1 cursor-pointer hover:underline"
                      >
                        <Icon name="edit" className="text-xs" />
                        <span>Change Email Address</span>
                      </button>
                    </div>

                    {/* Success notification */}
                    {successMsg && (
                      <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <Icon name="check_circle" className="text-sm text-emerald-600 shrink-0" />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    {/* Dev OTP Notification (when SMTP is not configured yet) */}
                    {devOtpHint && (
                      <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <Icon name="info" className="text-sm text-amber-700" />
                          <span>Local Development Mode</span>
                        </div>
                        <p className="text-[11px] text-amber-800 mb-1.5">
                          SMTP credentials pending. Your 6-digit verification code is:
                        </p>
                        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-amber-300">
                          <code className="font-mono font-bold text-sm text-emerald-800 tracking-wider">
                            {devOtpHint}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              const digits = devOtpHint.split("");
                              setOtpDigits(digits);
                              inputRefs.current[5]?.focus();
                            }}
                            className="text-[10px] text-emerald-700 font-bold hover:underline"
                          >
                            Auto-Fill
                          </button>
                        </div>
                      </div>
                    )}

                    {errorMsg && (
                      <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <Icon name="warning" className="text-sm shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* 6-Digit OTP Form */}
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-3 text-center">
                          6-Digit Verification Code
                        </label>
                        <div className="flex justify-between items-center gap-2 sm:gap-2.5">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => { inputRefs.current[idx] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-12 h-14 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-xs"
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || otpDigits.join("").length !== 6}
                        className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        <span>{isSubmitting ? "Verifying Code..." : "Verify & Sign In"}</span>
                        <Icon name="arrow_forward" className="text-sm" />
                      </button>

                      {/* Resend Code Section */}
                      <div className="text-center pt-2">
                        {canResend ? (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isSubmitting}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer hover:underline"
                          >
                            Didn&apos;t receive code? Resend Code
                          </button>
                        ) : (
                          <p className="text-xs text-slate-500">
                            Resend code in{" "}
                            <span className="font-semibold text-slate-800 font-mono">
                              {resendTimer}s
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Back button */}
                      <div className="pt-2 border-t border-slate-100 text-center">
                        <button
                          type="button"
                          onClick={() => { setStep("email"); setErrorMsg(""); }}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                        >
                          <Icon name="arrow_back" className="text-xs" />
                          <span>Back to all login options</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-zinc-500">Loading authentication...</p>
          </div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
