"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <div className="w-full max-w-sm text-center">
      <Link href="/" className="block font-display text-2xl font-bold tracking-tight mb-8">
        Listing<span className="text-terracotta">Forge</span>
      </Link>

      <div className="bg-white border border-border rounded-2xl p-8">
        <div className="text-4xl mb-4">📬</div>
        <h1 className="font-display text-xl font-bold mb-2">Check your inbox</h1>
        <p className="text-sm text-ink-muted mb-2">
          We sent a confirmation link to
        </p>
        <p className="text-sm font-bold text-ink mb-5">{email}</p>
        <p className="text-sm text-ink-muted mb-6">
          Click the link in the email to activate your account. It may take a minute to arrive — check your spam folder if you don&apos;t see it.
        </p>
        <Link
          href="/auth?mode=login"
          className="block w-full py-3 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition"
        >
          Go to Log In
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-sm text-ink-muted">Loading...</div>}>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}