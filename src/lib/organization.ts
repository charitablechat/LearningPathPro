import { supabase } from './supabase';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  owner_id: string;
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled' | 'lifetime';
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  stripe_monthly_price_id: string | null;
  stripe_yearly_price_id: string | null;
  max_courses: number | null;
  max_instructors: number | null;
  max_learners: number | null;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: string;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'discount' | 'lifetime_deal' | 'trial_extension';
  discount_percent: number | null;
  discount_amount: number | null;
  max_redemptions: number | null;
  redemptions_count: number;
  lifetime_plan_limits: Record<string, any> | null;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getOrganization(organizationId: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }

  return data;
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }

  return data;
}

export async function createOrganization(params: {
  name: string;
  slug: string;
  owner_id: string;
  primary_color?: string;
  secondary_color?: string;
}): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name: params.name,
      slug: params.slug,
      owner_id: params.owner_id,
      primary_color: params.primary_color || '#3B82F6',
      secondary_color: params.secondary_color || '#1E40AF',
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating organization:', error);
    return null;
  }

  return data;
}

export async function updateOrganization(
  organizationId: string,
  updates: Partial<Organization>
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating organization:', error);
    return null;
  }

  return data;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_monthly', { ascending: true });

  if (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }

  return data || [];
}

export async function getOrganizationSubscription(
  organizationId: string
): Promise<{ subscription: Subscription; plan: SubscriptionPlan } | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plan:subscription_plans(*)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    subscription: data,
    plan: data.plan,
  };
}

export async function validatePromoCode(code: string): Promise<PromoCode | null> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error validating promo code:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  const now = new Date();
  const validFrom = new Date(data.valid_from);
  const validUntil = data.valid_until ? new Date(data.valid_until) : null;

  if (now < validFrom || (validUntil && now > validUntil)) {
    return null;
  }

  if (data.max_redemptions !== null && data.redemptions_count >= data.max_redemptions) {
    return null;
  }

  return data;
}

export async function redeemPromoCode(
  promoCodeId: string,
  organizationId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase.from('promo_code_redemptions').insert({
    promo_code_id: promoCodeId,
    organization_id: organizationId,
    redeemed_by: userId,
  });

  if (error) {
    console.error('Error redeeming promo code:', error);
    return false;
  }

  await supabase.rpc('increment_promo_redemptions', { promo_id: promoCodeId });

  return true;
}

export async function getOrganizationUsage(organizationId: string) {
  const [coursesResult, instructorsResult, learnersResult] = await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('role', 'instructor'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('role', 'learner'),
  ]);

  return {
    courses: coursesResult.count || 0,
    instructors: instructorsResult.count || 0,
    learners: learnersResult.count || 0,
  };
}

export async function checkFeatureLimit(
  organizationId: string,
  feature: 'courses' | 'instructors' | 'learners'
): Promise<{ allowed: boolean; current: number; max: number | null }> {
  const org = await getOrganization(organizationId);
  if (!org) {
    return { allowed: false, current: 0, max: null };
  }

  if (org.subscription_status === 'lifetime') {
    const { data: redemption } = await supabase
      .from('promo_code_redemptions')
      .select('promo_code:promo_codes(lifetime_plan_limits)')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (redemption?.promo_code?.lifetime_plan_limits) {
      const limits = redemption.promo_code.lifetime_plan_limits;
      const usage = await getOrganizationUsage(organizationId);
      const maxKey = `max_${feature}`;
      const max = limits[maxKey] || null;
      const current = usage[feature];

      return {
        allowed: max === null || current < max,
        current,
        max,
      };
    }
  }

  const subData = await getOrganizationSubscription(organizationId);
  if (!subData) {
    return { allowed: false, current: 0, max: null };
  }

  const usage = await getOrganizationUsage(organizationId);
  const maxKey = `max_${feature}` as keyof SubscriptionPlan;
  const max = subData.plan[maxKey] as number | null;
  const current = usage[feature];

  return {
    allowed: max === null || current < max,
    current,
    max,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
