import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="px-6 md:px-12 py-4 flex items-center justify-between border-b border-border">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Listing<span className="text-terracotta">Forge</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-16">
        <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-ink-faint mb-10">Last updated: March 6, 2026</p>

        <div className="space-y-8 text-sm text-ink-soft leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <p><strong>Account Information:</strong> Email address and password when you create an account.</p>
            <p><strong>Usage Data:</strong> Information about how you use the Service, including features accessed, listings generated, and timestamps.</p>
            <p><strong>Payment Information:</strong> Payment details are processed and stored securely by Stripe. We do not store your credit card information on our servers.</p>
            <p><strong>Product Data:</strong> Product names, descriptions, and other information you input for listing generation and research.</p>
            <p><strong>Technical Data:</strong> IP address, browser type, and device information for security and analytics purposes.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <p>• Provide and improve the Service</p>
            <p>• Process payments and manage subscriptions</p>
            <p>• Send service-related communications (account confirmation, billing notifications)</p>
            <p>• Prevent fraud and abuse (IP tracking for trial abuse prevention)</p>
            <p>• Analyze usage patterns to improve features</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">3. Data Storage and Security</h2>
            <p>Your data is stored securely using Supabase (database) and Vercel (hosting). We use industry-standard encryption and security measures to protect your information. Payment processing is handled entirely by Stripe, which is PCI DSS compliant.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <p><strong>Supabase:</strong> Authentication and database hosting</p>
            <p><strong>Stripe:</strong> Payment processing</p>
            <p><strong>Vercel:</strong> Application hosting</p>
            <p><strong>Anthropic (Claude):</strong> AI content generation</p>
            <p><strong>Google Trends:</strong> Product research data</p>
            <p><strong>Resend:</strong> Transactional email delivery</p>
            <p className="mt-3">Each service has its own privacy policy governing how they handle data.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">5. Data Retention</h2>
            <p>We retain your account data and listing history for as long as your account is active. Generated listings are stored to provide the History feature. You may request deletion of your account and associated data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <p>• Access your personal data</p>
            <p>• Correct inaccurate data</p>
            <p>• Request deletion of your data</p>
            <p>• Export your data</p>
            <p>• Opt out of non-essential communications</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">7. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking cookies or sell your data to advertisers.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">8. Children&apos;s Privacy</h2>
            <p>The Service is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink mb-3">10. Contact</h2>
            <p>For privacy-related questions or data requests, contact us at <a href="mailto:privacy@listingforge.pro" className="text-terracotta hover:underline">privacy@listingforge.pro</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}