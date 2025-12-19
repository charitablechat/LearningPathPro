/*
  # Organization Management Functions

  1. Functions
    - delete_organization_safely: Safely deletes an organization and all related data
      - Handles cascading deletions for courses, modules, lessons, enrollments, etc.
      - Returns success/error status

  2. Security
    - Only callable by super admins through RLS policies
    - Validates organization exists before deletion
    - Provides clear error messages
*/

-- Function to safely delete an organization
CREATE OR REPLACE FUNCTION delete_organization_safely(
  org_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_super_admin boolean;
  v_org_exists boolean;
BEGIN
  -- Check if user is super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT v_is_super_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admins can delete organizations'
    );
  END IF;

  -- Check if organization exists
  SELECT EXISTS(SELECT 1 FROM organizations WHERE id = org_id) INTO v_org_exists;

  IF NOT v_org_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Organization not found'
    );
  END IF;

  -- Delete the organization (CASCADE will handle related records)
  DELETE FROM organizations WHERE id = org_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Organization deleted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
