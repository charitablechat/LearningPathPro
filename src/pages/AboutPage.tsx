import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { navigateTo } from '../lib/router';
import { Target, Heart, Zap, Users } from 'lucide-react';

export function AboutPage() {
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

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-8">
          <BackButton to="/" className="text-slate-300 hover:text-white" />
        </div>
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            About Clear Course Studio
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Empowering educators and organizations to create exceptional learning experiences
          </p>
        </div>

        <div className="mb-16">
          <Card className="p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-4">
              At Clear Course Studio, we believe that education should be accessible, engaging, and effective.
              Our mission is to provide educators and organizations with the tools they need to create and
              deliver outstanding online learning experiences.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              We're committed to simplifying the complexity of learning management while providing powerful
              features that scale with your needs. Whether you're an independent educator, a growing training
              organization, or an enterprise, we're here to support your journey.
            </p>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Simplicity</h3>
              <p className="text-slate-300 leading-relaxed">
                We believe powerful tools don't have to be complicated. Our intuitive interface makes
                course creation and management straightforward for everyone.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Learner-Focused</h3>
              <p className="text-slate-300 leading-relaxed">
                Every feature we build starts with one question: How does this improve the learning
                experience? We're obsessed with creating engaging, effective learning environments.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Innovation</h3>
              <p className="text-slate-300 leading-relaxed">
                We continuously evolve our platform based on the latest educational research and
                technological advances to keep you ahead of the curve.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Community</h3>
              <p className="text-slate-300 leading-relaxed">
                We're building more than software - we're fostering a community of educators who
                share best practices and support each other's success.
              </p>
            </Card>
          </div>
        </div>

        <div className="mb-16">
          <Card className="p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Why Choose Us?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Built by Educators, for Educators</h4>
                  <p className="text-slate-300">
                    Our team includes experienced educators who understand the challenges you face.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Trusted by Organizations Worldwide</h4>
                  <p className="text-slate-300">
                    From small businesses to large enterprises, organizations trust us with their learning programs.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Responsive Support</h4>
                  <p className="text-slate-300">
                    Our dedicated support team is here to help you succeed, every step of the way.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Continuous Improvement</h4>
                  <p className="text-slate-300">
                    We release new features and improvements regularly based on your feedback.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Become part of a growing community of educators creating exceptional learning experiences.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8" href="/signup">
            Get Started Today
          </Button>
          <p className="text-blue-100 text-sm mt-4">14-day free trial • No credit card required</p>
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
