import { Button } from '../components/Button';
import { navigateTo } from '../lib/router';
import { ArrowLeft } from 'lucide-react';

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/Clear Course Studio.png" alt="Clear Course Studio" className="h-10" />
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
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-slate-400 mb-8">Last Updated: January 13, 2025</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                By accessing or using Clear Course Studio ("Service"), you agree to be bound by these Terms of Service
                ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
              </p>
              <p className="text-slate-300 leading-relaxed">
                These Terms apply to all users of the Service, including organizations, instructors, administrators,
                and learners. By creating an account, you represent that you are at least 18 years old or have the
                consent of a parent or guardian.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Clear Course Studio is a multi-tenant learning management system (LMS) that enables organizations to
                create, manage, and deliver online courses. The Service includes:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Course creation and management tools</li>
                <li>User management for organizations, instructors, and learners</li>
                <li>Content hosting and delivery</li>
                <li>Analytics and reporting features</li>
                <li>Subscription management and billing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                To use the Service, you must create an account by providing accurate and complete information. You are
                responsible for:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your account information remains accurate and up-to-date</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent
                or illegal activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription Plans and Billing</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Clear Course Studio offers multiple subscription plans with different features and limits:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Free Trial:</strong> 14-day trial with full access to Starter plan features</li>
                <li><strong>Starter Plan:</strong> $29/month or $290/year</li>
                <li><strong>Professional Plan:</strong> $99/month or $990/year</li>
                <li><strong>Enterprise Plan:</strong> $499/month or $5,490/year</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                <strong>Billing Terms:</strong>
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Subscriptions are billed in advance on a recurring basis (monthly or yearly)</li>
                <li>You authorize us to charge your payment method on file</li>
                <li>Prices are subject to change with 30 days notice</li>
                <li>Failed payments may result in service suspension</li>
                <li>You can cancel your subscription at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Cancellation and Refunds</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You may cancel your subscription at any time through your account settings. Upon cancellation:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Your service will continue until the end of your current billing period</li>
                <li>You will not be charged for subsequent billing periods</li>
                <li>Your data will be retained for 30 days before permanent deletion</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Refunds are handled according to our Refund Policy. Generally, we offer prorated refunds for annual
                subscriptions canceled within the first 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Acceptable Use Policy</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Spam or send unsolicited communications</li>
                <li>Attempt to gain unauthorized access to systems or data</li>
                <li>Resell or redistribute the Service without permission</li>
                <li>Upload content that is illegal, obscene, or discriminatory</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Content Ownership and License</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                <strong>Your Content:</strong> You retain all ownership rights to content you upload to the Service.
                By uploading content, you grant us a limited license to store, display, and transmit your content
                solely for the purpose of providing the Service.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                <strong>Our Content:</strong> The Service itself, including its design, features, and functionality,
                is owned by Clear Course Studio and protected by intellectual property laws.
              </p>
              <p className="text-slate-300 leading-relaxed">
                You represent and warrant that you have all necessary rights to upload and share content through
                the Service and that your content does not violate any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Data Privacy and Security</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our
                Privacy Policy. By using the Service, you consent to our data practices as described in the Privacy
                Policy.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We implement reasonable security measures to protect your data, but cannot guarantee absolute security.
                You are responsible for maintaining the security of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Service Availability and Modifications</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We may:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Perform scheduled maintenance with advance notice</li>
                <li>Modify, suspend, or discontinue features at any time</li>
                <li>Update the Service to improve functionality or security</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                We are not liable for any downtime, data loss, or unavailability of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLEAR COURSE STUDIO SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Any damages arising from use or inability to use the Service</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Our total liability for any claims related to the Service is limited to the amount you paid us in
                the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Indemnification</h2>
              <p className="text-slate-300 leading-relaxed">
                You agree to indemnify and hold harmless Clear Course Studio from any claims, damages, losses, or
                expenses arising from your use of the Service, violation of these Terms, or infringement of any
                third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Termination</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We may terminate or suspend your account immediately, without notice, if you:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Fail to pay subscription fees</li>
                <li>Abuse or misuse the Service</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Upon termination, your right to use the Service ceases immediately, and we may delete your data
                after a 30-day grace period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Dispute Resolution</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Any disputes arising from these Terms or the Service shall be resolved through binding arbitration
                in accordance with the rules of the American Arbitration Association. You waive your right to
                participate in class action lawsuits.
              </p>
              <p className="text-slate-300 leading-relaxed">
                These Terms are governed by the laws of the State of Delaware, without regard to conflict of law
                principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Changes to Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                We may update these Terms from time to time. We will notify you of material changes by email or
                through the Service. Your continued use of the Service after such changes constitutes acceptance
                of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Contact Information</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                <strong>Clear Course Studio</strong><br />
                Email: legal@clearcoursestudio.com<br />
                Support: support@clearcoursestudio.com
              </p>
            </section>

            <section className="border-t border-slate-700 pt-8">
              <p className="text-slate-400 text-sm">
                By using Clear Course Studio, you acknowledge that you have read, understood, and agree to be bound
                by these Terms of Service.
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
                <img src="/Clear Course Studio.png" alt="Clear Course Studio" className="h-8" />
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
