import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { navigateTo } from '../lib/router';
import {
  Zap, Users, TrendingUp, Shield,
  Video, FileText, BarChart3, Cloud, Lock, Smartphone,
  Palette, MessageSquare, Award, Clock, Repeat
} from 'lucide-react';

export function FeaturesPage() {
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
            <a href="/pricing" onClick={(e) => { e.preventDefault(); navigateTo('/pricing'); }} className="text-slate-300 hover:text-white transition-colors">
              Pricing
            </a>
            <Button href="/login">Sign In</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Powerful Features for Modern Learning
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Everything you need to create, manage, and scale exceptional online learning experiences
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Course Creation & Management</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Intuitive Course Builder</h3>
              <p className="text-slate-400">
                Drag-and-drop interface for building courses in minutes. No technical skills required.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Rich Media Support</h3>
              <p className="text-slate-400">
                Upload videos, PDFs, documents, presentations, and more. Support for all major file formats.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Structured Lessons</h3>
              <p className="text-slate-400">
                Organize content into modules and lessons with clear progression paths for learners.
              </p>
            </Card>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Analytics & Insights</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-cyan-600/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Analytics</h3>
              <p className="text-slate-400">
                Track learner progress, engagement, and completion rates with comprehensive dashboards.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Performance Reports</h3>
              <p className="text-slate-400">
                Generate detailed reports on course performance, user engagement, and learning outcomes.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-pink-600/20 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Progress Tracking</h3>
              <p className="text-slate-400">
                Monitor individual learner progress and identify those who need additional support.
              </p>
            </Card>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Multi-Tenant & Collaboration</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Organization Management</h3>
              <p className="text-slate-400">
                Each organization gets its own isolated workspace with custom settings and branding.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Custom Branding</h3>
              <p className="text-slate-400">
                White-label solution with custom colors, logos, and domain options for your brand.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Team Collaboration</h3>
              <p className="text-slate-400">
                Multiple instructors and admins can collaborate on course creation and management.
              </p>
            </Card>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Security & Reliability</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Enterprise Security</h3>
              <p className="text-slate-400">
                Bank-level encryption, secure authentication, and regular security audits keep your data safe.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-cyan-600/20 flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">99.9% Uptime</h3>
              <p className="text-slate-400">
                Hosted on reliable cloud infrastructure with automatic backups and disaster recovery.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Data Privacy</h3>
              <p className="text-slate-400">
                GDPR compliant with full data ownership. Your data is yours, always.
              </p>
            </Card>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">User Experience</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Mobile Responsive</h3>
              <p className="text-slate-400">
                Perfect experience on any device - desktop, tablet, or mobile phone.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Progress Persistence</h3>
              <p className="text-slate-400">
                Learners can stop and resume courses anytime without losing their progress.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center mb-4">
                <Repeat className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Seamless Updates</h3>
              <p className="text-slate-400">
                Update course content anytime. Changes are instantly available to all learners.
              </p>
            </Card>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start creating exceptional learning experiences today with a 14-day free trial.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8" href="/signup">
            Start Free Trial
          </Button>
          <p className="text-blue-100 text-sm mt-4">No credit card required</p>
        </div>
      </div>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Clear Course Studio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
