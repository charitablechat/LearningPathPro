/*
  # Fix Profiles RLS Policies

  ## Problem
  There are duplicate and conflicting RLS policies on the profiles table causing the app
  to hang on the loading screen. Multiple policies with different logic are interfering 
  with each other.

  ## Changes
  1. Drop all existing profiles RLS policies
  2. Create clean, non-conflicting policies:
     - SELECT: Authenticated users can view all profiles in their org + superadmins can view all
     - INSERT: Users can only insert their own profile
     - UPDATE: Users can update their own profile + superadmins can update any profile
     - DELETE: Superadmins only

  ## Security
  - Maintains data isolation per organization
  - Allows superadmin global access
  - Users can only modify their own data (unless superadmin)
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new, clean policies
CREATE POLICY "Authenticated users can view profiles in their organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  )
  WITH CHECK (
    (auth.uid() = id AND is_super_admin = (SELECT is_super_admin FROM profiles WHERE id = auth.uid()))
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Superadmins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );
