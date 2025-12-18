/*
  # Add Update User Role Function

  1. New Functions
    - `update_user_role` - Allows super admins to change a user's role
      - Parameters:
        - `target_user_id` (uuid) - The ID of the user whose role to update
        - `new_role` (text) - The new role to assign (learner, instructor, or admin)
      - Returns: JSON object with success status and message
      - Security: Only callable by super admins

  2. Security
    - Function validates that the caller is a super admin
    - Validates that the new role is valid
    - Prevents users from modifying their own role
*/

-- Create function to update user role
CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_is_superadmin boolean;
  is_valid_role boolean;
BEGIN
  -- Check if caller is a super admin
  SELECT is_super_admin INTO caller_is_superadmin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT caller_is_superadmin THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only super admins can update user roles'
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
      'error', 'User not found'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'User role updated successfully'
  );
END;
$$;
