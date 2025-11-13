import { GraduationCap, Sparkles, Users, TrendingUp, Shield, Zap, ArrowRight, Star, Quote } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-10" />
            <span className="text-xl font-bold text-white">Clear Course Studio</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/pricing" className="text-slate-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="/login" className="text-slate-300 hover:text-white transition-colors">
              Sign In
            </a>
            <Button href="/signup">Get Started Free</Button>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400 font-medium">14-day free trial • No credit card required</span>
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
          Your Complete
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Learning Management
          </span>
          <br />
          Platform
        </h1>

        <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto">
          Build, manage, and scale your online courses with a platform designed for modern educators.
          Everything you need to create exceptional learning experiences.
        </p>

        <div className="flex items-center justify-center space-x-4">
          <Button size="lg" href="/signup" className="text-lg px-8">
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button size="lg" variant="outline" href="/pricing" className="text-lg px-8">
            View Pricing
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">5,000+</div>
            <div className="text-slate-400">Active Learners</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">250+</div>
            <div className="text-slate-400">Organizations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
            <div className="text-slate-400">Average Rating</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-slate-400">
            Powerful features that make course creation and management effortless
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Quick Setup</h3>
            <p className="text-slate-400">
              Launch your learning platform in minutes. Our intuitive course builder makes content
              creation fast and simple.
            </p>
          </Card>

          <Card className="p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Multi-Tenant</h3>
            <p className="text-slate-400">
              Each organization gets its own branded space with custom colors, logos, and domain
              options.
            </p>
          </Card>

          <Card className="p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Advanced Analytics</h3>
            <p className="text-slate-400">
              Track learner progress, course completion rates, and engagement metrics in real-time.
            </p>
          </Card>

          <Card className="p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Secure & Reliable</h3>
            <p className="text-slate-400">
              Enterprise-grade security with automatic backups and 99.9% uptime guarantee.
            </p>
          </Card>

          <Card className="p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-cyan-600/20 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Rich Content</h3>
            <p className="text-slate-400">
              Support for videos, PDFs, documents, quizzes, and more. Upload any type of learning
              material.
            </p>
          </Card>

          <Card className="p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-pink-600/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Custom Branding</h3>
            <p className="text-slate-400">
              Make it yours with custom colors, logos, and domain names. Your brand, your way.
            </p>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Trusted by Educators Worldwide
          </h2>
          <p className="text-xl text-slate-400">
            See what our users have to say about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="p-8">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-blue-400 mb-4" />
            <p className="text-slate-300 mb-6 leading-relaxed">
              "Clear Course Studio transformed how we deliver training. The platform is intuitive, powerful, and our learners love it. Setup took less than an hour!"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold">
                SJ
              </div>
              <div className="ml-4">
                <div className="font-semibold text-white">Sarah Johnson</div>
                <div className="text-sm text-slate-400">Training Director, TechCorp</div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-blue-400 mb-4" />
            <p className="text-slate-300 mb-6 leading-relaxed">
              "As an independent educator, I needed something affordable yet professional. This platform exceeded my expectations in every way."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                MC
              </div>
              <div className="ml-4">
                <div className="font-semibold text-white">Michael Chen</div>
                <div className="text-sm text-slate-400">Independent Instructor</div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-blue-400 mb-4" />
            <p className="text-slate-300 mb-6 leading-relaxed">
              "The analytics features help us identify struggling students early. We've seen a 40% increase in course completion rates since switching."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-semibold">
                EP
              </div>
              <div className="ml-4">
                <div className="font-semibold text-white">Emily Parker</div>
                <div className="text-sm text-slate-400">Academic Dean, Learning Institute</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations using ClearCourseStudio to deliver exceptional learning
            experiences.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-blue-100 text-sm mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

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
                <li><a href="/pricing" onClick={(e) => { e.preventDefault(); window.location.href = '/pricing'; }} className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/features" onClick={(e) => { e.preventDefault(); window.location.href = '/features'; }} className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/about" onClick={(e) => { e.preventDefault(); window.location.href = '/about'; }} className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/contact" onClick={(e) => { e.preventDefault(); window.location.href = '/contact'; }} className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/faq" onClick={(e) => { e.preventDefault(); window.location.href = '/faq'; }} className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/refunds" className="hover:text-white transition-colors">Refund Policy</a></li>
                <li><a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} Clear Course Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
