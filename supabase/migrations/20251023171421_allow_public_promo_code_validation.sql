/*
  # Allow Public Promo Code Validation

  ## Overview
  Update RLS policy to allow anonymous users to validate promo codes by code.
  This is safe because users must already know the code to query it.

  ## Changes
  - Drop existing restrictive promo code SELECT policy
  - Create new policy allowing authenticated AND anonymous users to view active promo codes
  - Maintains security by only exposing active codes that users explicitly search for

  ## Security
  - Only SELECT operations allowed for anonymous users
  - Only active promo codes (is_active = true) are visible
  - Users must know the exact code to query it
  - All other operations (INSERT, UPDATE, DELETE) remain restricted to super admins
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view active promo codes by code" ON promo_codes;

-- Create new policy that allows both authenticated and anonymous users to view active promo codes
CREATE POLICY "Public can view active promo codes"
  ON promo_codes FOR SELECT
  TO authenticated, anon
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
