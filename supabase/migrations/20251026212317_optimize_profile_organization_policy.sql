/*
  # Optimize Profile Organization Policy

  ## Problem
  The "Users can view profiles in same organization" policy still uses a subquery
  that could potentially cause performance issues or edge cases.

  ## Solution
  Create a helper function similar to is_super_admin() that returns the current
  user's organization_id efficiently, then use it in the policy.

  ## Changes
  1. Create get_user_organization_id() function
  2. Update the organization viewing policy to use this function
  3. This eliminates the subquery and makes the policy more efficient

  ## Security
  - Maintains same security boundaries
  - More efficient query execution
  - Eliminates potential for complex subquery issues
*/

-- Create helper function to get current user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  org_id uuid;
BEGIN
  SELECT organization_id INTO org_id
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN org_id;
END;
$$;

-- Update the organization viewing policy to use the helper function
DROP POLICY IF EXISTS "Users can view profiles in same organization" ON profiles;

CREATE POLICY "Users can view profiles in same organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL 
    AND organization_id = get_user_organization_id()
  );

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;
