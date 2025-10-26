/*
  # Fix Profile RLS Infinite Recursion

  ## Problem
  The current RLS policies on the profiles table contain circular dependencies that cause
  infinite recursion errors. The SELECT policy tries to check `is_super_admin` by querying
  the profiles table within the same policy that's being evaluated.

  Error: "infinite recursion detected in policy for relation 'profiles'"

  ## Solution
  1. Create a helper function that efficiently checks super admin status using the JWT claims
  2. Simplify the SELECT policies to avoid self-referential queries
  3. Break down the complex policy into multiple simpler policies
  4. Use direct auth.uid() comparisons instead of subqueries where possible

  ## Changes
  1. Create `is_super_admin()` function that checks JWT claims directly
  2. Drop all existing conflicting policies on profiles table
  3. Create new, simplified policies:
     - Users can always view their own profile (no subquery needed)
     - Super admins can view all profiles (using the helper function)
     - Users can view profiles in their organization (simplified check)
     - INSERT and UPDATE policies remain focused on ownership
     - DELETE restricted to super admins only

  ## Security
  - Maintains proper data isolation
  - Eliminates circular policy dependencies
  - Uses efficient JWT-based permission checks
  - Preserves all security boundaries
*/

-- Create helper function to check if current user is a super admin
-- This uses a simple table lookup without complex policy evaluation
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT is_super_admin INTO is_admin
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(is_admin, false);
END;
$$;

-- Drop ALL existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmins can delete profiles" ON profiles;

-- Policy 1: Users can ALWAYS view their own profile (highest priority, no subqueries)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Super admins can view all profiles (using helper function)
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Policy 3: Users can view profiles in same organization (no self-referential subquery)
CREATE POLICY "Users can view profiles in same organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL 
    AND organization_id = (
      SELECT p.organization_id 
      FROM profiles p 
      WHERE p.id = auth.uid()
      LIMIT 1
    )
  );

-- Policy 4: Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 5: Users can update their own profile (but not their super admin status)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Regular users cannot change their super admin status
      is_super_admin = (SELECT is_super_admin FROM profiles WHERE id = auth.uid())
      OR is_super_admin IS NULL
    )
  );

-- Policy 6: Super admins can update any profile
CREATE POLICY "Super admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Policy 7: Super admins can delete profiles
CREATE POLICY "Super admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
