import { Button } from '../components/Button';
import { navigateTo } from '../lib/router';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-400 mb-8">Last Updated: January 13, 2025</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Clear Course Studio ("we", "our", or "us") respects your privacy and is committed to protecting your
                personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our learning management platform.
              </p>
              <p className="text-slate-300 leading-relaxed">
                This policy applies to all users of our Service, including organization administrators, instructors,
                and learners. By using Clear Course Studio, you agree to the collection and use of information in
                accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Account Information:</strong> Name, email address, password, organization details</li>
                <li><strong>Profile Information:</strong> Profile photo, bio, preferences, role within organization</li>
                <li><strong>Content:</strong> Courses, lessons, videos, documents you upload or create</li>
                <li><strong>Payment Information:</strong> Billing details processed securely through Stripe</li>
                <li><strong>Communications:</strong> Messages, support requests, feedback you send to us</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, courses accessed</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address, device identifiers</li>
                <li><strong>Log Data:</strong> Access times, error logs, performance metrics</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Information from Third Parties</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Payment Processor:</strong> Payment status and transaction details from Stripe</li>
                <li><strong>Authentication:</strong> Email verification through our email service provider</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Service Delivery:</strong> Provide, operate, and maintain the platform</li>
                <li><strong>Account Management:</strong> Create and manage your account and organization</li>
                <li><strong>Communication:</strong> Send service updates, security alerts, and support messages</li>
                <li><strong>Billing:</strong> Process payments and send invoices</li>
                <li><strong>Improvement:</strong> Analyze usage to improve features and user experience</li>
                <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our Terms</li>
                <li><strong>Marketing:</strong> Send promotional emails (with your consent, opt-out available)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. How We Share Your Information</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Service Providers</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Stripe:</strong> Payment processing (they maintain their own privacy policy)</li>
                <li><strong>Email Service:</strong> Transactional and notification emails</li>
                <li><strong>Cloud Storage:</strong> Secure storage of course content and files</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Within Your Organization</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you belong to an organization on our platform, certain information may be visible to organization
                administrators, including your name, email, role, and learning activity.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Legal Requirements</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                We may disclose your information if required by law, court order, or government request, or to
                protect our rights and safety.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.4 Business Transfers</h3>
              <p className="text-slate-300 leading-relaxed">
                If we are involved in a merger, acquisition, or sale of assets, your information may be transferred
                to the new entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide the Service and fulfill the purposes
                outlined in this policy:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                <li><strong>Cancelled Accounts:</strong> Data retained for 30 days after cancellation</li>
                <li><strong>Billing Records:</strong> Retained for 7 years for tax and legal compliance</li>
                <li><strong>Log Data:</strong> Retained for 90 days for security and troubleshooting</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                After the retention period, we securely delete or anonymize your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You have the following rights regarding your personal data:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Access and Portability</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                You can access and export your personal data through your account settings or by contacting us.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Correction</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                You can update your account information at any time through your profile settings.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Deletion</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                You can request deletion of your account and personal data. Note that we may retain certain
                information for legal compliance.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.4 Marketing Opt-Out</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                You can unsubscribe from marketing emails using the link in any promotional email or through your
                account settings.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.5 Cookie Management</h3>
              <p className="text-slate-300 leading-relaxed">
                You can manage cookie preferences through your browser settings. See our Cookie Policy for details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Security</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Encryption:</strong> Data encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication</li>
                <li><strong>Monitoring:</strong> Continuous security monitoring and logging</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                <li><strong>Employee Training:</strong> Security awareness training for our team</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                While we strive to protect your data, no method of transmission over the internet is 100% secure.
                You are responsible for keeping your account credentials confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. International Data Transfers</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your country of
                residence. These countries may have different data protection laws.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We ensure appropriate safeguards are in place for international transfers, including standard
                contractual clauses and data processing agreements with our service providers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
              <p className="text-slate-300 leading-relaxed">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal
                information from children under 13. If you believe we have collected information from a child under
                13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. GDPR Rights (European Users)</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you are located in the European Economic Area (EEA), you have additional rights under GDPR:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@clearcoursestudio.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. CCPA Rights (California Users)</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to say no to the sale of personal information</li>
                <li>Right to access your personal information</li>
                <li>Right to request deletion of personal information</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                We do not sell your personal information. To exercise your CCPA rights, contact us at
                privacy@clearcoursestudio.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-slate-300 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                requirements. We will notify you of significant changes by email or through the Service. Your
                continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                <strong>Clear Course Studio</strong><br />
                Email: privacy@clearcoursestudio.com<br />
                Support: support@clearcoursestudio.com<br />
                Data Protection Officer: dpo@clearcoursestudio.com
              </p>
            </section>

            <section className="border-t border-slate-700 pt-8">
              <p className="text-slate-400 text-sm">
                This Privacy Policy is part of our Terms of Service. By using Clear Course Studio, you acknowledge
                that you have read and understood this Privacy Policy.
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
