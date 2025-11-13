import { Button } from '../components/Button';
import { navigateTo } from '../lib/router';
import { ArrowLeft } from 'lucide-react';

export function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo_variation_3_gradient.png" alt="Clear Course Studio" className="h-10" />
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
          <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
          <p className="text-slate-400 mb-8">Last Updated: January 13, 2025</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. What Are Cookies?</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when
                you visit a website. They are widely used to make websites work more efficiently and provide
                information to website owners.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Clear Course Studio uses cookies and similar technologies to enhance your experience, analyze usage,
                and improve our services. This Cookie Policy explains what cookies we use, why we use them, and how
                you can manage your cookie preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Essential Cookies (Strictly Necessary)</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                These cookies are necessary for the website to function properly and cannot be disabled:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Authentication:</strong> Keep you logged in as you navigate the platform</li>
                <li><strong>Security:</strong> Protect against cross-site request forgery (CSRF) attacks</li>
                <li><strong>Session Management:</strong> Remember your session across page loads</li>
                <li><strong>Load Balancing:</strong> Distribute traffic across servers</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4 italic">
                Legal Basis: These cookies are necessary for the performance of our contract with you.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Functional Cookies (Preferences)</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                These cookies enable enhanced functionality and personalization:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Theme Preferences:</strong> Remember your dark/light mode selection</li>
                <li><strong>Language Settings:</strong> Store your preferred language</li>
                <li><strong>UI Preferences:</strong> Remember layout and display preferences</li>
                <li><strong>Feature Tours:</strong> Track which tutorials you've seen</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4 italic">
                Legal Basis: Your consent, which you can withdraw at any time.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Analytics Cookies (Performance)</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                These cookies help us understand how visitors use our website:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Usage Analytics:</strong> Track which features are used most</li>
                <li><strong>Performance Monitoring:</strong> Identify slow-loading pages</li>
                <li><strong>Error Tracking:</strong> Detect and fix technical issues</li>
                <li><strong>A/B Testing:</strong> Test new features with user groups</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4 italic">
                Legal Basis: Your consent or legitimate interest in improving our services.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.4 Marketing Cookies (Advertising)</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                These cookies are used for marketing purposes:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Conversion Tracking:</strong> Measure effectiveness of ad campaigns</li>
                <li><strong>Retargeting:</strong> Show relevant ads based on your interests</li>
                <li><strong>Social Media:</strong> Enable sharing and social features</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4 italic">
                Legal Basis: Your explicit consent, which you can withdraw at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Specific Cookies We Use</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-slate-300 text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4">Cookie Name</th>
                      <th className="text-left py-3 px-4">Purpose</th>
                      <th className="text-left py-3 px-4">Duration</th>
                      <th className="text-left py-3 px-4">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-3 px-4 font-mono">sb-access-token</td>
                      <td className="py-3 px-4">Authentication token</td>
                      <td className="py-3 px-4">7 days</td>
                      <td className="py-3 px-4">Essential</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-3 px-4 font-mono">sb-refresh-token</td>
                      <td className="py-3 px-4">Session refresh</td>
                      <td className="py-3 px-4">30 days</td>
                      <td className="py-3 px-4">Essential</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-3 px-4 font-mono">theme_preference</td>
                      <td className="py-3 px-4">Dark/light mode</td>
                      <td className="py-3 px-4">1 year</td>
                      <td className="py-3 px-4">Functional</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-3 px-4 font-mono">cookie_consent</td>
                      <td className="py-3 px-4">Store cookie preferences</td>
                      <td className="py-3 px-4">1 year</td>
                      <td className="py-3 px-4">Essential</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-3 px-4 font-mono">_ga</td>
                      <td className="py-3 px-4">Google Analytics ID</td>
                      <td className="py-3 px-4">2 years</td>
                      <td className="py-3 px-4">Analytics</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-3 px-4 font-mono">_gid</td>
                      <td className="py-3 px-4">Google Analytics session</td>
                      <td className="py-3 px-4">24 hours</td>
                      <td className="py-3 px-4">Analytics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Cookies</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Some cookies are placed by third-party services that appear on our pages:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Stripe (Payment Processing)</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Purpose: Process payments securely</li>
                <li>Privacy Policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">stripe.com/privacy</a></li>
                <li>Type: Essential for payment processing</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Supabase (Backend Infrastructure)</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Purpose: Authentication and database services</li>
                <li>Privacy Policy: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">supabase.com/privacy</a></li>
                <li>Type: Essential for service operation</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Google Analytics (Optional)</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Purpose: Website analytics and insights</li>
                <li>Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">policies.google.com/privacy</a></li>
                <li>Type: Analytics (requires consent)</li>
                <li>Opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Google Analytics Opt-out</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. How to Manage Cookies</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Cookie Consent Banner</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                When you first visit our website, you'll see a cookie consent banner allowing you to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Customize your cookie preferences by category</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Browser Settings</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and data stored</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3 Account Settings</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Logged-in users can manage their cookie preferences through account settings at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Impact of Disabling Cookies</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Disabling certain types of cookies may impact your experience:
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Essential Cookies</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>You will not be able to log in or use authenticated features</li>
                <li>Core functionality of the platform will not work</li>
                <li>Security features will be disabled</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Functional Cookies</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Your preferences (theme, language) will not be saved</li>
                <li>You'll need to set preferences each visit</li>
                <li>Some personalization features may not work</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Analytics Cookies</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>The platform will still work normally</li>
                <li>We won't be able to track usage patterns to improve services</li>
                <li>Bug reports may be less detailed</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.4 Marketing Cookies</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>The platform will work normally</li>
                <li>You may see less relevant advertising</li>
                <li>Social media sharing features may be limited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Other Tracking Technologies</h2>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 Local Storage</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                We use browser local storage to save:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Application state and preferences</li>
                <li>Cached data for offline functionality</li>
                <li>Draft content you're working on</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 Session Storage</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Used for temporary data that's cleared when you close your browser:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Current page state</li>
                <li>Form data before submission</li>
                <li>Temporary UI state</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.3 Pixels and Beacons</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Small images used to track:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Email open rates (for marketing emails only)</li>
                <li>Page view analytics</li>
                <li>Conversion tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Cookie Retention Periods</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Different cookies are stored for different lengths of time:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain for a set period (see table in Section 3)</li>
                <li><strong>Authentication Cookies:</strong> 7-30 days or until you log out</li>
                <li><strong>Preference Cookies:</strong> Up to 1 year</li>
                <li><strong>Analytics Cookies:</strong> Up to 2 years</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Updates to This Policy</h2>
              <p className="text-slate-300 leading-relaxed">
                We may update this Cookie Policy to reflect changes in our practices or legal requirements. We'll
                notify you of significant changes through the platform or by email. The "Last Updated" date at the
                top indicates when the policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have questions about our use of cookies or this policy:
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
                This Cookie Policy is part of our Privacy Policy. By using Clear Course Studio, you acknowledge
                that you have read and understood how we use cookies.
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
                <img src="/logo_variation_3_gradient.png" alt="Clear Course Studio" className="h-8" />
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
