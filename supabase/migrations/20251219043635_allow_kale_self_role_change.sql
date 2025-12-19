/*
  # Allow Kale to Change Her Own Role

  1. Changes
    - Update `update_organization_user_role` function to allow kale@charitablechat.com to change her own role
    - All other users still cannot modify their own role
    - This exception is needed for administrative flexibility

  2. Security
    - Only kale@charitablechat.com can change her own role
    - All other self-role modification restrictions remain in place
    - Super admins can still update any user's role
    - Organization admins can only update roles within their own organization

  3. Implementation
    - Check if the caller is kale@charitablechat.com before enforcing the self-role change restriction
    - If the caller is Kale, allow the role change to proceed
    - Otherwise, maintain the existing restriction
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
  caller_email text;
  target_org_id uuid;
  is_valid_role boolean;
BEGIN
  -- Get caller's organization, role, super admin status, and email
  SELECT organization_id, role, is_super_admin, email
  INTO caller_org_id, caller_role, caller_is_superadmin, caller_email
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

  -- Prevent users from modifying their own role (except kale@charitablechat.com)
  IF target_user_id = auth.uid() AND caller_email != 'kale@charitablechat.com' THEN
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