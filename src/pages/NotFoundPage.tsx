import { Button } from '../components/Button';
import { navigateTo } from '../lib/router';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <img src="/logo_variation_3_gradient.png" alt="Clear Course Studio" className="h-20 mx-auto mb-8" />
          <h1 className="text-9xl font-bold text-white mb-4">404</h1>
          <h2 className="text-4xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-xl text-slate-400 mb-8">
            Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => window.history.back()}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
          <Button
            size="lg"
            onClick={() => navigateTo('/')}
            className="flex items-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Button>
        </div>

        <div className="mt-12 p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Looking for something specific?</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <a
              href="/pricing"
              onClick={(e) => { e.preventDefault(); navigateTo('/pricing'); }}
              className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h4 className="text-white font-semibold mb-1">Pricing</h4>
              <p className="text-slate-400 text-sm">View our plans and pricing</p>
            </a>
            <a
              href="/features"
              onClick={(e) => { e.preventDefault(); navigateTo('/features'); }}
              className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h4 className="text-white font-semibold mb-1">Features</h4>
              <p className="text-slate-400 text-sm">Explore platform features</p>
            </a>
            <a
              href="/about"
              onClick={(e) => { e.preventDefault(); navigateTo('/about'); }}
              className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h4 className="text-white font-semibold mb-1">About Us</h4>
              <p className="text-slate-400 text-sm">Learn about our mission</p>
            </a>
            <a
              href="/contact"
              onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }}
              className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h4 className="text-white font-semibold mb-1">Contact</h4>
              <p className="text-slate-400 text-sm">Get in touch with us</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
