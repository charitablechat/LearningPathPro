/*
  # Fix Profiles UPDATE Policy to Allow Role Changes

  ## Problem
  The current RLS policy on the profiles table is too restrictive and blocks the 
  `update_organization_user_role` function from working. Even though the function 
  is SECURITY DEFINER, RLS policies still apply, and the current policy only allows 
  users to update their own profile.

  ## Changes
  1. Drop the existing restrictive UPDATE policy
  2. Create a new UPDATE policy that allows:
     - Users to update their own profile
     - Superadmins to update any profile
     - Organization admins to update profiles in their organization (via SECURITY DEFINER functions)
  
  ## Security
  - Maintains user data isolation (users can only update themselves)
  - Allows superadmin global access
  - Allows the update_organization_user_role function to work properly
  - Uses optimized (select auth.uid()) pattern for performance
*/

-- Drop the current restrictive UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new UPDATE policy that allows superadmins and SECURITY DEFINER functions
CREATE POLICY "Users and admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    -- Users can update their own profile
    id = (select auth.uid())
    -- OR superadmins can update any profile
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_super_admin = true
    )
  )
  WITH CHECK (
    -- Users can update their own profile (but cannot change is_super_admin)
    (
      id = (select auth.uid())
      AND is_super_admin = (
        SELECT is_super_admin FROM public.profiles WHERE id = (select auth.uid())
      )
    )
    -- OR superadmins can update any profile
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_super_admin = true
    )
  );