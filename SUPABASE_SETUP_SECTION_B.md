# SECTION B: Multi-Tenant SaaS Features

**What this does:** Adds organizations, subscriptions, promo codes, and the critical `is_super_admin` field to profiles. This section is REQUIRED for superadmin functionality.

**Copy and paste this entire block:**

```sql
-- ============================================================================
-- SECTION B: Multi-Tenant SaaS Features
-- Adds: organizations, subscriptions, subscription_plans, promo_codes,
--       organization_invitations, and is_super_admin field
-- ============================================================================

-- ============================================================================
-- ADD ORGANIZATION CONTEXT TO PROFILES (CRITICAL FOR SUPERADMIN)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organization_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_super_admin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN theme_preference text DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark'));
  END IF;
END $$;

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  custom_domain text UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#3B82F6',
  secondary_color text DEFAULT '#1E40AF',
  owner_id uuid NOT NULL,
  subscription_status text DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'lifetime')),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key after organizations table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_organization_id_fkey'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'organizations_owner_id_fkey'
  ) THEN
    ALTER TABLE organizations
    ADD CONSTRAINT organizations_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- SUBSCRIPTION_PLANS TABLE
-- ============================================================================
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

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
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

-- ============================================================================
-- PROMO_CODES TABLE
-- ============================================================================
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

-- ============================================================================
-- PROMO_CODE_REDEMPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid REFERENCES promo_codes(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  redeemed_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  UNIQUE(promo_code_id, organization_id)
);

-- ============================================================================
-- ORGANIZATION_INVITATIONS TABLE
-- ============================================================================
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

-- ============================================================================
-- ORGANIZATION_USAGE_LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  metadata jsonb,
  recorded_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ADD ORGANIZATION CONTEXT TO EXISTING TABLES
-- ============================================================================
DO $$
BEGIN
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

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================
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

-- ============================================================================
-- ENABLE RLS ON ALL NEW TABLES
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_usage_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR ORGANIZATIONS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Organization owners can update their organization" ON organizations;
CREATE POLICY "Organization owners can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true))
  WITH CHECK (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can delete organizations" ON organizations;
CREATE POLICY "Super admins can delete organizations"
  ON organizations FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- ============================================================================
-- RLS POLICIES FOR SUBSCRIPTION_PLANS
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

DROP POLICY IF EXISTS "Super admins can manage subscription plans" ON subscription_plans;
CREATE POLICY "Super admins can manage subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- ============================================================================
-- RLS POLICIES FOR SUBSCRIPTIONS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view subscriptions for their organization" ON subscriptions;
CREATE POLICY "Users can view subscriptions for their organization"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Organization owners can manage subscriptions" ON subscriptions;
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

-- ============================================================================
-- RLS POLICIES FOR PROMO_CODES
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

DROP POLICY IF EXISTS "Super admins can manage promo codes" ON promo_codes;
CREATE POLICY "Super admins can manage promo codes"
  ON promo_codes FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================
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

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
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
```

**After running, verify with:**
```sql
SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('organizations', 'subscription_plans', 'subscriptions', 'promo_codes')
ORDER BY table_name;
```

You should see 4 new tables listed.

**Verify the is_super_admin field was added:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'is_super_admin';
```

You should see the `is_super_admin` column with type `boolean` and default `false`.

---
