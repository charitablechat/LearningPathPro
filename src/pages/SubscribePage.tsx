import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { getSubscriptionPlans, SubscriptionPlan } from '../lib/organization';
import { createCheckoutSession, redirectToCheckout } from '../lib/stripe';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { navigateTo } from '../lib/router';

export function SubscribePage() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubscribe = async () => {
    if (!plan || !currentOrganization || !user) {
      setError('Missing required information');
      return;
    }

    const priceId = billingCycle === 'monthly'
      ? plan.stripe_monthly_price_id
      : plan.stripe_yearly_price_id;

    if (!priceId) {
      setError('Price ID not configured for this plan');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const sessionId = await createCheckoutSession({
        priceId,
        organizationId: currentOrganization.id,
        planId: plan.id,
        billingCycle,
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      await redirectToCheckout(sessionId);
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setProcessing(false);
    }
  };

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

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => navigateTo('/pricing')}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={processing}
              className="flex-1"
            >
              {processing ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </div>
        </Card>

        <p className="text-center text-sm text-slate-400">
          You will be redirected to Stripe for secure payment processing.
          <br />
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
