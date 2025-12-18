/*
  # Add Organization Admin Role Update Function

  1. New Functions
    - `update_organization_user_role` - Allows organization admins to change user roles within their organization
      - Parameters:
        - `target_user_id` (uuid) - The ID of the user whose role to update
        - `new_role` (text) - The new role to assign (learner, instructor, or admin)
      - Returns: JSON object with success status and message
      - Security: Only callable by organization admins for users in their organization

  2. Security
    - Function validates that the caller is an admin in their organization
    - Validates that the target user is in the same organization
    - Validates that the new role is valid
    - Prevents admins from modifying their own role
    - Prevents admins from promoting users to super admin level
*/

-- Create function to update user role for organization admins
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
  target_org_id uuid;
  is_valid_role boolean;
BEGIN
  -- Get caller's organization and role
  SELECT organization_id, role INTO caller_org_id, caller_role
  FROM profiles
  WHERE id = auth.uid();

  -- Check if caller is an admin in their organization
  IF caller_role != 'admin' THEN
    -- Check if they're a super admin
    DECLARE
      is_superadmin boolean;
    BEGIN
      SELECT is_super_admin INTO is_superadmin
      FROM profiles
      WHERE id = auth.uid();

      IF NOT is_superadmin THEN
        RETURN json_build_object(
          'success', false,
          'error', 'Only organization admins can update user roles'
        );
      END IF;
    END;
  END IF;

  -- Get target user's organization
  SELECT organization_id INTO target_org_id
  FROM profiles
  WHERE id = target_user_id;

  -- Verify target user exists
  IF target_org_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Verify both users are in the same organization (unless caller is super admin)
  IF caller_org_id != target_org_id AND caller_role = 'admin' THEN
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