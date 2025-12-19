/*
  # Fix Super Admin Role Update Permissions

  1. Changes
    - Update `update_organization_user_role` function to properly handle super admins
    - Super admins should be able to update any user's role regardless of organization
    - Organization admins can only update roles within their own organization

  2. Security
    - Super admins bypass organization membership checks
    - Organization admins must be in the same organization as the target user
    - Self-role modification is prevented
    - Only valid roles can be assigned

  3. Fixed Issue
    - Previous logic checked `caller_role = 'admin'` instead of checking super admin status
    - This prevented super admins from updating roles across organizations
*/

CREATE OR REPLACE FUNCTION update_organization_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_org_id uuid;
  caller_role text;
  caller_is_superadmin boolean;
  target_org_id uuid;
  is_valid_role boolean;
BEGIN
  -- Get caller's organization, role, and super admin status
  SELECT organization_id, role, is_super_admin 
  INTO caller_org_id, caller_role, caller_is_superadmin
  FROM profiles
  WHERE id = auth.uid();

  -- Check if caller is an admin or super admin
  IF caller_role != 'admin' AND NOT caller_is_superadmin THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only organization admins or super admins can update user roles'
    );
  END IF;

  -- Get target user's organization
  SELECT organization_id INTO target_org_id
  FROM profiles
  WHERE id = target_user_id;

  -- Verify target user exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Verify both users are in the same organization (unless caller is super admin)
  IF NOT caller_is_superadmin AND caller_org_id != target_org_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You can only update roles for users in your organization'
    );
  END IF;

  -- Validate the role
  is_valid_role := new_role IN ('learner', 'instructor', 'admin');

  IF NOT is_valid_role THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid role. Must be learner, instructor, or admin'
    );
  END IF;

  -- Prevent users from modifying their own role
  IF target_user_id = auth.uid() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You cannot modify your own role'
    );
  END IF;

  -- Update the user's role
  UPDATE profiles
  SET role = new_role::text,
      updated_at = now()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to update user role'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'User role updated successfully'
  );
END;
$$;
