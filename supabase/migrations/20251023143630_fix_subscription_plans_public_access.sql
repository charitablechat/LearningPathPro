/*
  # Fix Public Access to Subscription Plans
  
  ## Changes
  - Update RLS policy to allow anonymous (public) users to view active subscription plans
  - This enables the pricing page to display plans without requiring authentication
  
  ## Security
  - Only SELECT operations are allowed for anonymous users
  - Only active plans (is_active = true) are visible to the public
  - All other operations remain restricted to super admins
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;

-- Create new policy that allows both authenticated and anonymous users
CREATE POLICY "Public can view active subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated, anon
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
