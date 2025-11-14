import { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Download, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan?: {
    name: string;
    price_monthly: number;
    price_yearly: number;
    max_courses: number | null;
    max_instructors: number | null;
    max_learners: number | null;
    features: any;
  };
}

interface UsageStats {
  courses: { current: number; max: number | null };
  instructors: { current: number; max: number | null };
  learners: { current: number; max: number | null };
}

export function AdminSubscriptionDashboard() {
  const { organization } = useOrganization();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageStats>({
    courses: { current: 0, max: null },
    instructors: { current: 0, max: null },
    learners: { current: 0, max: null },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, [organization]);

  const loadSubscriptionData = async () => {
    if (!organization) return;

    try {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('organization_id', organization.id)
        .single();

      setSubscription(subData);

      const [coursesRes, instructorsRes, learnersRes] = await Promise.all([
        supabase
          .from('courses')
          .select('id')
          .eq('organization_id', organization.id),
        supabase
          .from('profiles')
          .select('id')
          .eq('organization_id', organization.id)
          .eq('role', 'instructor'),
        supabase
          .from('profiles')
          .select('id')
          .eq('organization_id', organization.id)
          .eq('role', 'learner'),
      ]);

      setUsage({
        courses: {
          current: coursesRes.data?.length || 0,
          max: subData?.plan?.max_courses || null,
        },
        instructors: {
          current: instructorsRes.data?.length || 0,
          max: subData?.plan?.max_instructors || null,
        },
        learners: {
          current: learnersRes.data?.length || 0,
          max: subData?.plan?.max_learners || null,
        },
      });
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, max: number | null) => {
    if (max === null) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntilRenewal = () => {
    if (!subscription) return 0;
    const end = new Date(subscription.current_period_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (organization?.subscription_status === 'trial') {
    const trialEnds = organization.trial_ends_at ? new Date(organization.trial_ends_at) : null;
    const daysLeft = trialEnds ? Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    return (
      <div className="space-y-6">
        <Card className="bg-blue-900/20 border-blue-800">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Free Trial Active</h3>
              <p className="text-gray-300 mb-4">
                You have {daysLeft} days remaining in your 14-day free trial. Subscribe now to continue using the platform after your trial ends.
              </p>
              <Button>
                Choose a Plan
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
            <p className="text-gray-400 mb-4">Subscribe to a plan to continue using the platform</p>
            <Button>
              View Plans
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const daysUntilRenewal = getDaysUntilRenewal();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Subscription & Usage</h2>
        <p className="text-gray-400">Manage your subscription and monitor resource usage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{subscription.plan?.name} Plan</h3>
              <p className="text-gray-400 text-sm capitalize">{subscription.billing_cycle} billing</p>
            </div>
            <div className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm font-medium">
              Active
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Price</span>
              <span className="text-white font-bold text-xl">
                {formatPrice(
                  subscription.billing_cycle === 'monthly'
                    ? subscription.plan?.price_monthly || 0
                    : subscription.plan?.price_yearly || 0
                )}
                <span className="text-sm text-gray-400">/{subscription.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>
              </span>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Billing Cycle</span>
              </div>
              <p className="text-white">
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Renews in {daysUntilRenewal} days
              </p>
            </div>

            {subscription.cancel_at_period_end && (
              <div className="bg-yellow-900/20 border border-yellow-900 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-medium">Subscription Canceling</p>
                    <p className="text-yellow-400/80 text-sm">
                      Your subscription will end on {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1">
                Change Plan
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Invoices
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Resource Usage</h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Courses</span>
                <span className={`font-medium ${getUsageColor(getUsagePercentage(usage.courses.current, usage.courses.max))}`}>
                  {usage.courses.current} {usage.courses.max !== null ? `/ ${usage.courses.max}` : '(Unlimited)'}
                </span>
              </div>
              {usage.courses.max !== null && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      getUsagePercentage(usage.courses.current, usage.courses.max) >= 90
                        ? 'bg-red-500'
                        : getUsagePercentage(usage.courses.current, usage.courses.max) >= 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${getUsagePercentage(usage.courses.current, usage.courses.max)}%` }}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Instructors</span>
                <span className={`font-medium ${getUsageColor(getUsagePercentage(usage.instructors.current, usage.instructors.max))}`}>
                  {usage.instructors.current} {usage.instructors.max !== null ? `/ ${usage.instructors.max}` : '(Unlimited)'}
                </span>
              </div>
              {usage.instructors.max !== null && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      getUsagePercentage(usage.instructors.current, usage.instructors.max) >= 90
                        ? 'bg-red-500'
                        : getUsagePercentage(usage.instructors.current, usage.instructors.max) >= 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${getUsagePercentage(usage.instructors.current, usage.instructors.max)}%` }}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Learners</span>
                <span className={`font-medium ${getUsageColor(getUsagePercentage(usage.learners.current, usage.learners.max))}`}>
                  {usage.learners.current} {usage.learners.max !== null ? `/ ${usage.learners.max}` : '(Unlimited)'}
                </span>
              </div>
              {usage.learners.max !== null && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      getUsagePercentage(usage.learners.current, usage.learners.max) >= 90
                        ? 'bg-red-500'
                        : getUsagePercentage(usage.learners.current, usage.learners.max) >= 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${getUsagePercentage(usage.learners.current, usage.learners.max)}%` }}
                  />
                </div>
              )}
            </div>

            {(getUsagePercentage(usage.courses.current, usage.courses.max) >= 80 ||
              getUsagePercentage(usage.instructors.current, usage.instructors.max) >= 80 ||
              getUsagePercentage(usage.learners.current, usage.learners.max) >= 80) && (
              <div className="bg-yellow-900/20 border border-yellow-900 rounded-lg p-3 mt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-medium">Approaching Limit</p>
                    <p className="text-yellow-400/80 text-sm">
                      You're nearing your plan limits. Consider upgrading to avoid disruptions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Plan Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscription.plan?.features && Object.entries(subscription.plan.features).map(([key, value]) => (
            <div key={key} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-gray-400 text-sm">{String(value)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
