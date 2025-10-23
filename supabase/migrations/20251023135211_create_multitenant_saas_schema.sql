/*
  # Multi-Tenant SaaS Platform Schema

  ## Overview
  Complete database schema for transforming the LMS into a multi-tenant SaaS platform with organizations,
  subscriptions, payment processing, and feature limits.

  ## New Tables

  ### 1. organizations
  Core table for multi-tenant organization management
  - `id` (uuid, primary key) - Unique organization identifier
  - `name` (text) - Organization display name
  - `slug` (text, unique) - URL-friendly subdomain identifier
  - `custom_domain` (text, nullable) - Custom domain if configured
  - `logo_url` (text, nullable) - Organization logo for branding
  - `primary_color` (text) - Primary brand color (hex)
  - `secondary_color` (text) - Secondary brand color (hex)
  - `owner_id` (uuid, foreign key) - Reference to profiles table
  - `subscription_status` (text) - trial, active, past_due, canceled, lifetime
  - `trial_ends_at` (timestamptz, nullable) - When trial period ends
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. subscription_plans
  Available subscription tiers and pricing
  - `id` (uuid, primary key) - Plan identifier
  - `name` (text) - Plan name (Starter, Professional, Enterprise)
  - `slug` (text, unique) - URL-friendly identifier
  - `price_monthly` (integer) - Monthly price in cents
  - `price_yearly` (integer) - Yearly price in cents
  - `stripe_monthly_price_id` (text, nullable) - Stripe price ID for monthly
  - `stripe_yearly_price_id` (text, nullable) - Stripe price ID for yearly
  - `max_courses` (integer, nullable) - Course limit (null = unlimited)
  - `max_instructors` (integer, nullable) - Instructor limit (null = unlimited)
  - `max_learners` (integer, nullable) - Learner limit (null = unlimited)
  - `features` (jsonb) - Additional feature flags
  - `is_active` (boolean) - Whether plan is available for new signups
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. subscriptions
  Organization subscription records
  - `id` (uuid, primary key) - Subscription identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `plan_id` (uuid, foreign key) - Reference to subscription_plans
  - `stripe_subscription_id` (text, nullable) - Stripe subscription ID
  - `stripe_customer_id` (text, nullable) - Stripe customer ID
  - `status` (text) - trialing, active, past_due, canceled, unpaid
  - `billing_cycle` (text) - monthly or yearly
  - `current_period_start` (timestamptz) - Current billing period start
  - `current_period_end` (timestamptz) - Current billing period end
  - `cancel_at_period_end` (boolean) - Whether to cancel at period end
  - `canceled_at` (timestamptz, nullable) - Cancellation timestamp
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. promo_codes
  Promotional codes including LTD offers
  - `id` (uuid, primary key) - Promo code identifier
  - `code` (text, unique) - The actual promo code
  - `type` (text) - discount, lifetime_deal, trial_extension
  - `discount_percent` (integer, nullable) - Percentage discount
  - `discount_amount` (integer, nullable) - Fixed amount discount in cents
  - `max_redemptions` (integer, nullable) - Maximum uses (null = unlimited)
  - `redemptions_count` (integer) - Current redemption count
  - `lifetime_plan_limits` (jsonb, nullable) - Limits for LTD codes
  - `valid_from` (timestamptz) - When code becomes valid
  - `valid_until` (timestamptz, nullable) - When code expires
  - `is_active` (boolean) - Whether code is currently active
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. promo_code_redemptions
  Track promo code usage
  - `id` (uuid, primary key) - Redemption identifier
  - `promo_code_id` (uuid, foreign key) - Reference to promo_codes
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `redeemed_by` (uuid, foreign key) - Reference to profiles
  - `redeemed_at` (timestamptz) - Redemption timestamp

  ### 6. organization_invitations
  Pending invitations to organizations
  - `id` (uuid, primary key) - Invitation identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `email` (text) - Invited email address
  - `role` (text) - instructor or learner
  - `invited_by` (uuid, foreign key) - Reference to profiles
  - `token` (text, unique) - Unique invitation token
  - `expires_at` (timestamptz) - Expiration timestamp
  - `accepted_at` (timestamptz, nullable) - Acceptance timestamp
  - `created_at` (timestamptz) - Creation timestamp

  ### 7. organization_usage_logs
  Track organization resource usage
  - `id` (uuid, primary key) - Log entry identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `metric_type` (text) - course_created, user_invited, storage_used, etc.
  - `metric_value` (numeric) - Metric value
  - `metadata` (jsonb, nullable) - Additional context
  - `recorded_at` (timestamptz) - Timestamp of measurement

  ## Modified Tables

  ### profiles
  Added organization context:
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `is_super_admin` (boolean) - Platform super admin flag

  ### courses, modules, lessons, enrollments, lesson_progress
  Added organization context:
  - `organization_id` (uuid, foreign key) - Reference to organizations

  ## Security
  - Enable RLS on all new tables
  - Create restrictive policies based on organization membership and roles
  - Super admin bypass for platform management
  - Secure stripe webhook endpoints

  ## Important Notes
  1. All monetary values stored in cents (integers)
  2. Unlimited features represented as NULL in limit columns
  3. Trial period is 14 days from organization creation
  4. LTD codes limited to 150 total redemptions
  5. Organization slugs used for subdomain routing
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  custom_domain text UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#3B82F6',
  secondary_color text DEFAULT '#1E40AF',
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_status text DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'lifetime')),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price_monthly integer NOT NULL,
  price_yearly integer NOT NULL,
  stripe_monthly_price_id text,
  stripe_yearly_price_id text,
  max_courses integer,
  max_instructors integer,
  max_learners integer,
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('discount', 'lifetime_deal', 'trial_extension')),
  discount_percent integer CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount integer CHECK (discount_amount >= 0),
  max_redemptions integer,
  redemptions_count integer DEFAULT 0,
  lifetime_plan_limits jsonb,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create promo_code_redemptions table
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid REFERENCES promo_codes(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  redeemed_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  UNIQUE(promo_code_id, organization_id)
);

-- Create organization_invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('instructor', 'learner')),
  invited_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create organization_usage_logs table
CREATE TABLE IF NOT EXISTS organization_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  metadata jsonb,
  recorded_at timestamptz DEFAULT now()
);

-- Add organization context to existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_super_admin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE courses ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'modules' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE modules ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE lessons ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enrollments' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE enrollments ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lesson_progress' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE lesson_progress ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON organizations(custom_domain);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_courses_organization_id ON courses(organization_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_organization_id ON enrollments(organization_id);

-- Enable RLS on all new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Organization owners can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true))
  WITH CHECK (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Super admins can delete organizations"
  ON organizations FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY "Super admins can manage subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view subscriptions for their organization"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Organization owners can manage subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  )
  WITH CHECK (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- RLS Policies for promo_codes
CREATE POLICY "Anyone can view active promo codes by code"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY "Super admins can manage promo codes"
  ON promo_codes FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- RLS Policies for promo_code_redemptions
CREATE POLICY "Users can view redemptions for their organization"
  ON promo_code_redemptions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR redeemed_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Users can redeem promo codes"
  ON promo_code_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (redeemed_by = auth.uid());

-- RLS Policies for organization_invitations
CREATE POLICY "Users can view invitations for their organization"
  ON organization_invitations FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Organization members can create invitations"
  ON organization_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

CREATE POLICY "Invited users can update invitations"
  ON organization_invitations FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- RLS Policies for organization_usage_logs
CREATE POLICY "Users can view usage logs for their organization"
  ON organization_usage_logs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "System can insert usage logs"
  ON organization_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update RLS policies for existing tables to include organization context
DROP POLICY IF EXISTS "Users can view courses based on role" ON courses;
CREATE POLICY "Users can view courses in their organization"
  ON courses FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Instructors and admins can create courses" ON courses;
CREATE POLICY "Instructors and admins can create courses in their organization"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

DROP POLICY IF EXISTS "Instructors and admins can update their courses" ON courses;
CREATE POLICY "Instructors and admins can update courses in their organization"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

DROP POLICY IF EXISTS "Instructors and admins can delete their courses" ON courses;
CREATE POLICY "Instructors and admins can delete courses in their organization"
  ON courses FOR DELETE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, max_courses, max_instructors, max_learners, features)
VALUES
  ('Starter', 'starter', 2900, 29000, 5, 2, 100, '{"support": "email", "analytics": "basic"}'),
  ('Professional', 'professional', 9900, 99000, 25, 10, 500, '{"support": "priority", "analytics": "advanced", "custom_branding": true}'),
  ('Enterprise', 'enterprise', 49900, 549000, NULL, NULL, 2000, '{"support": "dedicated", "analytics": "advanced", "custom_branding": true, "custom_domain": true, "api_access": true}')
ON CONFLICT (slug) DO NOTHING;

-- Insert LTD promo code
INSERT INTO promo_codes (code, type, max_redemptions, lifetime_plan_limits, valid_from, valid_until, is_active)
VALUES (
  'LTD2025',
  'lifetime_deal',
  150,
  '{"max_courses": 30, "max_instructors": 15, "max_learners": 1000, "features": {"support": "priority", "analytics": "advanced", "custom_branding": true}}',
  now(),
  NULL,
  true
)
ON CONFLICT (code) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();