import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { getSubscriptionPlans, SubscriptionPlan } from '../lib/organization';
import { useAuth } from '../contexts/AuthContext';

export function PricingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const fetchedPlans = await getSubscriptionPlans();
      setPlans(fetchedPlans);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const handleGetStarted = (planSlug: string) => {
    if (!user) {
      window.location.href = '/login?redirect=/pricing';
    } else {
      window.location.href = `/subscribe?plan=${planSlug}&cycle=${billingCycle}`;
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
  };

  const getYearlySavings = (monthly: number, yearly: number) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    const percentSavings = Math.round((savings / monthlyCost) * 100);
    return percentSavings;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading pricing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-8">
          <BackButton to="/" className="text-slate-300 hover:text-white" />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Start with a 14-day free trial. No credit card required.
          </p>

          <div className="inline-flex items-center bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-600 px-2 py-1 rounded">
                Save {plans[0] && getYearlySavings(plans[0].price_monthly, plans[0].price_yearly)}%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const isPopular = index === 1;
            const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

            return (
              <Card
                key={plan.id}
                className={`p-8 relative ${
                  isPopular ? 'border-2 border-blue-500 shadow-xl scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(price)}
                    </span>
                    <span className="text-slate-400 ml-2">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-slate-400 mt-1">
                      {formatPrice(plan.price_yearly / 12)}/month billed annually
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleGetStarted(plan.slug)}
                  className={`w-full mb-6 ${
                    isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''
                  }`}
                  variant={isPopular ? 'primary' : 'outline'}
                >
                  Start Free Trial
                </Button>

                <div className="space-y-4">
                  <div className="flex items-center text-slate-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span>
                      {plan.max_courses === null ? 'Unlimited' : plan.max_courses} courses
                    </span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span>
                      {plan.max_instructors === null ? 'Unlimited' : plan.max_instructors} instructors
                    </span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span>
                      Up to {plan.max_learners?.toLocaleString()} learners
                    </span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span>
                      {plan.features.support === 'email' && 'Email support'}
                      {plan.features.support === 'priority' && 'Priority support'}
                      {plan.features.support === 'dedicated' && 'Dedicated support'}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    {plan.features.analytics ? (
                      <>
                        <Check className="w-5 h-5 text-green-400 mr-3" />
                        <span>
                          {plan.features.analytics === 'basic' && 'Basic analytics'}
                          {plan.features.analytics === 'advanced' && 'Advanced analytics'}
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-slate-600 mr-3" />
                        <span className="text-slate-500">Advanced analytics</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center text-slate-300">
                    {plan.features.custom_branding ? (
                      <>
                        <Check className="w-5 h-5 text-green-400 mr-3" />
                        <span>Custom branding</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-slate-600 mr-3" />
                        <span className="text-slate-500">Custom branding</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center text-slate-300">
                    {plan.features.custom_domain ? (
                      <>
                        <Check className="w-5 h-5 text-green-400 mr-3" />
                        <span>Custom domain</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-slate-600 mr-3" />
                        <span className="text-slate-500">Custom domain</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center text-slate-300">
                    {plan.features.api_access ? (
                      <>
                        <Check className="w-5 h-5 text-green-400 mr-3" />
                        <span>API access</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-slate-600 mr-3" />
                        <span className="text-slate-500">API access</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Looking for a Lifetime Deal?
          </h2>
          <p className="text-blue-100 text-lg mb-6">
            Get lifetime access with our special LTD offer. Limited to 150 seats!
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-6 text-left max-w-2xl mx-auto">
            <div className="flex items-center text-white">
              <Check className="w-5 h-5 mr-2" />
              <span>30 courses</span>
            </div>
            <div className="flex items-center text-white">
              <Check className="w-5 h-5 mr-2" />
              <span>15 instructors</span>
            </div>
            <div className="flex items-center text-white">
              <Check className="w-5 h-5 mr-2" />
              <span>1,000 learners</span>
            </div>
            <div className="flex items-center text-white">
              <Check className="w-5 h-5 mr-2" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center text-white">
              <Check className="w-5 h-5 mr-2" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center text-white">
              <Check className="w-5 h-5 mr-2" />
              <span>Custom branding</span>
            </div>
          </div>
          <Button
            onClick={() => {
              if (!user) {
                window.location.href = '/login?redirect=/pricing';
              } else {
                window.location.href = '/subscribe?ltd=true';
              }
            }}
            className="bg-white text-blue-600 hover:bg-slate-100"
          >
            Claim Your Lifetime Deal
          </Button>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <Card className="p-6">
              <h4 className="text-white font-semibold mb-2">Can I change plans later?</h4>
              <p className="text-slate-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                immediately.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-white font-semibold mb-2">What happens after the trial?</h4>
              <p className="text-slate-400">
                After your 14-day trial, you'll be prompted to select a paid plan. Your data
                remains safe and you can export it anytime.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-white font-semibold mb-2">Do you offer refunds?</h4>
              <p className="text-slate-400">
                Yes, we offer a 30-day money-back guarantee on all annual plans. No questions
                asked.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-white font-semibold mb-2">Is there a setup fee?</h4>
              <p className="text-slate-400">
                No setup fees, ever. The price you see is the price you pay. No hidden costs.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
