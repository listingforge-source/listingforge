"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "../lib/supabase";
import Link from "next/link";

declare global {
  interface Window {
    turnstile: any;
    onTurnstileLoad: () => void;
  }
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;

    window.onTurnstileLoad = () => {
      if (captchaRef.current && !widgetId.current) {
        widgetId.current = window.turnstile.render(captchaRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          callback: (token: string) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(""),
          theme: "light",
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (widgetId.current) {
        try { window.turnstile.remove(widgetId.current); } catch {}
        widgetId.current = null;
      }
    };
  }, []);

  const resetCaptcha = () => {
    setCaptchaToken("");
    if (widgetId.current) {
      try { window.turnstile.reset(widgetId.current); } catch {}
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!captchaToken) {
      setMessage("Please complete the captcha verification.");
      setLoading(false);
      return;
    }

    // Verify captcha server-side
    const captchaRes = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: captchaToken }),
    });
    const captchaData = await captchaRes.json();

    if (!captchaData.success) {
      setMessage("Captcha verification failed. Please try again.");
      resetCaptcha();
      setLoading(false);
      return;
    }

    if (!isLogin) {
      const hasUppercase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      if (!hasUppercase || !hasNumber || !hasSymbol) {
        setMessage("Password must include an uppercase letter, a number, and a symbol.");
        resetCaptcha();
        setLoading(false);
        return;
      }
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        resetCaptcha();
      } else {
        window.location.href = "/app";
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        resetCaptcha();
      } else {
        window.location.href = "/auth/confirm?email=" + encodeURIComponent(email);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center font-display text-2xl font-bold tracking-tight mb-8">
          Listing<span className="text-terracotta">Forge</span>
        </Link>

        <div className="bg-white border border-border rounded-2xl p-8">
          {!isLogin && (
            <div className="bg-terracotta/5 border border-terracotta/15 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm font-bold text-terracotta mb-1">3-day free trial included</p>
              <p className="text-[11px] text-ink-muted">All Growth features unlocked instantly. No credit card needed.</p>
            </div>
          )}
          <h1 className="font-display text-xl font-bold mb-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-ink-muted mb-6">
            {isLogin ? "Log in to continue generating listings" : "Start generating listings for free"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
              />
            </div>

            <div ref={captchaRef} className="flex justify-center" />

            {message && (
              <p className={`text-xs ${message.includes("Check") || message.includes("resent") ? "text-sage" : "text-red-500"}`}>
                {message}
              </p>
            )}

            {message && (message.includes("confirmed") || message.includes("Email not confirmed")) ? (
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setMessage("");
                  const { error } = await supabase.auth.resend({
                    type: "signup",
                    email,
                  });
                  if (error) {
                    setMessage(error.message);
                  } else {
                    setMessage("Confirmation email resent! Check your inbox.");
                  }
                  setLoading(false);
                }}
                className="w-full py-2.5 text-xs font-bold text-terracotta border border-terracotta/20 rounded-full hover:bg-terracotta/5 transition"
              >
                Resend Confirmation Email
              </button>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition disabled:opacity-50"
            >
              {loading ? "..." : isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>

          <p className="text-xs text-ink-muted text-center mt-5">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
                resetCaptcha();
              }}
              className="text-terracotta font-bold hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}