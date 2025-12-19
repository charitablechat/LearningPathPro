import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { getSubscriptionPlans, SubscriptionPlan } from '../lib/organization';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { navigateTo } from '../lib/router';
import { AlertCircle } from 'lucide-react';

export function SubscribePage() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planSlug = params.get('plan');
    const cycle = params.get('cycle') as 'monthly' | 'yearly' | null;

    if (!planSlug) {
      navigateTo('/pricing');
      return;
    }

    if (cycle) {
      setBillingCycle(cycle);
    }

    const fetchPlan = async () => {
      const plans = await getSubscriptionPlans();
      const selectedPlan = plans.find(p => p.slug === planSlug);

      if (!selectedPlan) {
        navigateTo('/pricing');
        return;
      }

      setPlan(selectedPlan);
      setLoading(false);
    };

    fetchPlan();
  }, []);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading subscription details...</div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const pricePerMonth = billingCycle === 'monthly'
    ? plan.price_monthly
    : Math.round(plan.price_yearly / 12);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Complete Your Subscription</h1>
          <p className="text-slate-400">
            You're subscribing to the {plan.name} plan for {currentOrganization?.name}
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{plan.name} Plan</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-400">{formatPrice(price)}</span>
              <span className="text-slate-400">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-sm text-green-400 mt-2">
                {formatPrice(pricePerMonth)} per month when billed annually
              </p>
            )}
          </div>

          <div className="space-y-2 mb-6 pb-6 border-b border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Billing Cycle</span>
              <span className="text-white capitalize">{billingCycle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Max Courses</span>
              <span className="text-white">{plan.max_courses || 'Unlimited'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Max Instructors</span>
              <span className="text-white">{plan.max_instructors || 'Unlimited'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Max Learners</span>
              <span className="text-white">{plan.max_learners || 'Unlimited'}</span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium mb-1">Payment Processing Coming Soon</p>
                <p className="text-blue-400/80 text-sm">
                  Online payment processing is currently being set up. Please contact us to activate this plan for your organization.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => navigateTo('/pricing')}
              className="flex-1"
            >
              Back to Pricing
            </Button>
            <Button
              onClick={() => navigateTo('/contact')}
              className="flex-1"
            >
              Contact Us
            </Button>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            Questions about this plan? Visit our{' '}
            <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">
              Contact Page
            </a>{' '}
            or check out the{' '}
            <a href="/faq" className="text-blue-400 hover:text-blue-300 underline">
              FAQ
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
