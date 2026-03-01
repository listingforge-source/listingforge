"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
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
      } else {
        setMessage("Check your email to confirm your account!");
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

            {message && (
              <p className={`text-xs ${message.includes("Check") ? "text-sage" : "text-red-500"}`}>
                {message}
              </p>
            )}

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