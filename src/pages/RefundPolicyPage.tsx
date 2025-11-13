import { Button } from '../components/Button';
import { navigateTo } from '../lib/router';
import { ArrowLeft } from 'lucide-react';

export function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-10" />
            <span className="text-xl font-bold text-white">Clear Course Studio</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }} className="text-slate-300 hover:text-white transition-colors">
              Home
            </a>
            <Button href="/login">Sign In</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-slate-800/50 rounded-2xl p-8 md:p-12 border border-slate-700">
          <h1 className="text-4xl font-bold text-white mb-4">Refund Policy</h1>
          <p className="text-slate-400 mb-8">Last Updated: January 13, 2025</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Overview</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                At Clear Course Studio, we want you to be completely satisfied with our service. This Refund Policy
                outlines the conditions under which refunds are available and how to request one.
              </p>
              <p className="text-slate-300 leading-relaxed">
                This policy applies to all subscription plans offered through Clear Course Studio. By subscribing
                to our service, you agree to the terms outlined in this Refund Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. 14-Day Free Trial</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We offer a 14-day free trial for new customers to evaluate our platform:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>No credit card required during the trial period</li>
                <li>Full access to Starter plan features</li>
                <li>Cancel anytime during the trial with no charges</li>
                <li>No refund necessary as no payment is collected during trial</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                We strongly encourage you to use the trial period to ensure our service meets your needs before
                subscribing to a paid plan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Monthly Subscriptions</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Refund Eligibility</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Monthly subscriptions are eligible for a full refund if:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Requested within 7 days of the initial charge</li>
                <li>This is your first paid subscription period (not applicable after trial)</li>
                <li>No excessive usage of platform resources has occurred</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Non-Refundable Situations</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Monthly subscriptions are NOT eligible for refunds if:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>More than 7 days have passed since the charge</li>
                <li>This is a renewal charge (not your first payment)</li>
                <li>Your account was terminated for violating our Terms of Service</li>
                <li>You have already received a refund for a previous subscription period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Annual Subscriptions</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Prorated Refunds</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Annual subscriptions are eligible for a prorated refund if:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Requested within 30 days of the initial annual charge</li>
                <li>Refund amount is calculated based on unused months remaining</li>
                <li>Monthly rate used for calculation (annual discount is forfeited)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Full Refund (First 7 Days)</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you request a refund within 7 days of your initial annual subscription charge, you are eligible
                for a full refund with no questions asked.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Calculation Example</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Professional Plan Annual: $990/year
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Equivalent monthly rate: $99/month</li>
                <li>Cancelled after 3 months of use</li>
                <li>Refund: $99 × 9 remaining months = $891</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Lifetime Deal Promo Code</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Organizations created with our LTD2025 promo code receive lifetime access:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>No payment is collected for lifetime deal redemptions</li>
                <li>Refunds are not applicable as the service is provided free of charge</li>
                <li>Lifetime access is subject to our Terms of Service</li>
                <li>We reserve the right to terminate accounts that violate our Terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cancellation vs. Refund</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                It's important to understand the difference:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Cancellation</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>You can cancel your subscription anytime</li>
                <li>Your service continues until the end of your paid period</li>
                <li>No future charges will occur</li>
                <li>No refund is automatically issued for the current period</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Refund Request</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>You explicitly request money back for your current subscription period</li>
                <li>Subject to eligibility criteria outlined in this policy</li>
                <li>Your account access ends immediately upon refund approval</li>
                <li>Must be requested through our support channels</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. How to Request a Refund</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 Required Information</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                To request a refund, please provide:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Your account email address</li>
                <li>Organization name</li>
                <li>Date of the charge you're requesting a refund for</li>
                <li>Brief reason for the refund request (optional but helpful)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 Contact Methods</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Submit your refund request through:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Email: refunds@clearcoursestudio.com</li>
                <li>Support portal: support@clearcoursestudio.com</li>
                <li>Through your account settings (if available)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.3 Processing Time</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>We review refund requests within 2 business days</li>
                <li>Approved refunds are processed within 5-7 business days</li>
                <li>Refunds appear on your statement in 5-10 business days</li>
                <li>You'll receive email confirmation when your refund is processed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Non-Refundable Items and Services</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Add-on Services:</strong> One-time setup fees, custom development, consulting</li>
                <li><strong>Third-Party Costs:</strong> Domain registration, SSL certificates purchased through us</li>
                <li><strong>Partial Month Usage:</strong> Monthly subscriptions used for partial months</li>
                <li><strong>Overage Charges:</strong> Fees for exceeding plan limits</li>
                <li><strong>Previous Months:</strong> Charges from previous billing cycles</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Data Retention After Refund</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                When a refund is issued:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Your account access is immediately terminated</li>
                <li>Your data is retained for 30 days in case you change your mind</li>
                <li>After 30 days, all data is permanently deleted</li>
                <li>You can export your data before requesting a refund</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Disputes and Chargebacks</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you have a billing dispute:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Contact us first before initiating a chargeback with your bank</li>
                <li>Most issues can be resolved quickly through direct communication</li>
                <li>Chargebacks may result in immediate account termination</li>
                <li>We reserve the right to dispute illegitimate chargebacks</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                We're committed to fair resolution of all billing issues and encourage you to work with us directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Service Credits</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                In some cases, we may offer service credits instead of refunds:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Extended service downtime (beyond our SLA)</li>
                <li>Billing errors on our part</li>
                <li>As goodwill gestures for service issues</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Service credits are applied to future billing and cannot be redeemed for cash.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
              <p className="text-slate-300 leading-relaxed">
                We may update this Refund Policy from time to time. Changes will be posted on this page with an
                updated "Last Updated" date. Continued use of the service after changes constitutes acceptance of
                the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
              <p className="text-slate-300 leading-relaxed">
                For refund requests or questions about this policy:
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                <strong>Clear Course Studio</strong><br />
                Email: refunds@clearcoursestudio.com<br />
                Support: support@clearcoursestudio.com<br />
                Business Hours: Monday-Friday, 9 AM - 5 PM EST
              </p>
            </section>

            <section className="border-t border-slate-700 pt-8">
              <p className="text-slate-400 text-sm">
                This Refund Policy is part of our Terms of Service. By subscribing to Clear Course Studio, you
                acknowledge that you have read and agree to this Refund Policy.
              </p>
            </section>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-8" />
                <span className="text-lg font-bold text-white">Clear Course Studio</span>
              </div>
              <p className="text-slate-400 text-sm">
                Modern learning management platform for educators and organizations.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/pricing" onClick={(e) => { e.preventDefault(); navigateTo('/pricing'); }} className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/features" onClick={(e) => { e.preventDefault(); navigateTo('/features'); }} className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/faq" onClick={(e) => { e.preventDefault(); navigateTo('/faq'); }} className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/terms" onClick={(e) => { e.preventDefault(); navigateTo('/terms'); }} className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" onClick={(e) => { e.preventDefault(); navigateTo('/privacy'); }} className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/refunds" onClick={(e) => { e.preventDefault(); navigateTo('/refunds'); }} className="hover:text-white transition-colors">Refund Policy</a></li>
                <li><a href="/cookies" onClick={(e) => { e.preventDefault(); navigateTo('/cookies'); }} className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            © 2025 Clear Course Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
