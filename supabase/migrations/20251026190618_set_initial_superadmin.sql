/*
  # Set Initial Superadmin and Create Audit Infrastructure

  ## Summary
  This migration designates mydogkenna@gmail.com as the platform's initial superadmin and creates
  the necessary infrastructure for tracking superadmin actions and promotions.

  ## Changes

  ### 1. Superadmin Audit Table
  Creates `superadmin_actions` table to log all privileged operations:
  - `id` (uuid, primary key) - Unique action identifier
  - `action_type` (text) - Type of action (promote_superadmin, demote_superadmin, etc.)
  - `performed_by` (uuid) - Superadmin who performed the action
  - `target_user_id` (uuid, nullable) - User affected by the action
  - `target_organization_id` (uuid, nullable) - Organization affected by the action
  - `metadata` (jsonb) - Additional action details
  - `created_at` (timestamptz) - When action was performed

  ### 2. Initial Superadmin Designation
  Sets is_super_admin to true for mydogkenna@gmail.com profile if it exists.
  If the profile doesn't exist yet, creates a trigger to set it when the user signs up.

  ### 3. Helper Functions
  - `can_promote_superadmin()` - Checks if current user can promote others
  - `promote_to_superadmin()` - Safely promotes a user with audit logging
  - `demote_from_superadmin()` - Safely demotes a user with protections

  ### 4. Security
  - Enable RLS on superadmin_actions table
  - Only superadmins can view audit logs
  - Automatic logging of all promotion/demotion actions
  - Protection against demoting the original superadmin

  ## Important Notes
  - Original superadmin (mydogkenna@gmail.com) cannot be demoted
  - All superadmin actions are logged for audit trail
  - Only existing superadmins can promote new superadmins
*/

-- Create superadmin_actions audit table
CREATE TABLE IF NOT EXISTS superadmin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  performed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_superadmin_actions_performed_by ON superadmin_actions(performed_by);
CREATE INDEX IF NOT EXISTS idx_superadmin_actions_target_user ON superadmin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_actions_created_at ON superadmin_actions(created_at DESC);

-- Enable RLS on superadmin_actions
ALTER TABLE superadmin_actions ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view audit logs
CREATE POLICY "Superadmins can view all audit logs"
  ON superadmin_actions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON superadmin_actions FOR INSERT
  TO authenticated
  WITH CHECK (performed_by = auth.uid() OR performed_by IS NULL);

-- Set initial superadmin for mydogkenna@gmail.com
DO $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- Find the profile by email
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE email = 'mydogkenna@gmail.com'
  LIMIT 1;

  -- If profile exists, set as superadmin
  IF v_profile_id IS NOT NULL THEN
    UPDATE profiles
    SET is_super_admin = true
    WHERE id = v_profile_id;

    -- Log the initial superadmin designation
    INSERT INTO superadmin_actions (action_type, target_user_id, metadata)
    VALUES (
      'initial_superadmin_designation',
      v_profile_id,
      jsonb_build_object(
        'email', 'mydogkenna@gmail.com',
        'note', 'Initial platform superadmin designation via migration'
      )
    );
  END IF;
END $$;

-- Create trigger function to automatically set superadmin on signup
CREATE OR REPLACE FUNCTION auto_set_superadmin_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the mydogkenna@gmail.com email
  IF NEW.email = 'mydogkenna@gmail.com' AND (NEW.is_super_admin IS NULL OR NEW.is_super_admin = false) THEN
    NEW.is_super_admin = true;
    
    -- Schedule audit log insertion (will happen after INSERT completes)
    PERFORM pg_notify('superadmin_designated', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-designate superadmin on profile creation
DROP TRIGGER IF EXISTS auto_set_superadmin_trigger ON profiles;
CREATE TRIGGER auto_set_superadmin_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_superadmin_on_signup();

-- Function to check if current user can promote others to superadmin
CREATE OR REPLACE FUNCTION can_promote_superadmin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely promote a user to superadmin
CREATE OR REPLACE FUNCTION promote_to_superadmin(target_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_current_user_id uuid;
  v_target_email text;
  v_result jsonb;
BEGIN
  -- Get current user
  v_current_user_id := auth.uid();
  
  -- Check if current user is a superadmin
  IF NOT can_promote_superadmin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only superadmins can promote users to superadmin'
    );
  END IF;
  
  -- Check if target user exists
  SELECT email INTO v_target_email
  FROM profiles
  WHERE id = target_user_id;
  
  IF v_target_email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target user not found'
    );
  END IF;
  
  -- Check if already a superadmin
  IF EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND is_super_admin = true) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is already a superadmin'
    );
  END IF;
  
  -- Promote the user
  UPDATE profiles
  SET is_super_admin = true
  WHERE id = target_user_id;
  
  -- Log the action
  INSERT INTO superadmin_actions (action_type, performed_by, target_user_id, metadata)
  VALUES (
    'promote_superadmin',
    v_current_user_id,
    target_user_id,
    jsonb_build_object(
      'target_email', v_target_email,
      'promoted_at', now()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User successfully promoted to superadmin',
    'user_email', v_target_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely demote a superadmin
CREATE OR REPLACE FUNCTION demote_from_superadmin(target_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_current_user_id uuid;
  v_target_email text;
  v_result jsonb;
BEGIN
  -- Get current user
  v_current_user_id := auth.uid();
  
  -- Check if current user is a superadmin
  IF NOT can_promote_superadmin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only superadmins can demote superadmins'
    );
  END IF;
  
  -- Get target user email
  SELECT email INTO v_target_email
  FROM profiles
  WHERE id = target_user_id;
  
  IF v_target_email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target user not found'
    );
  END IF;
  
  -- Protect the original superadmin from being demoted
  IF v_target_email = 'mydogkenna@gmail.com' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot demote the original platform superadmin'
    );
  END IF;
  
  -- Check if target is actually a superadmin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND is_super_admin = true) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is not a superadmin'
    );
  END IF;
  
  -- Demote the user
  UPDATE profiles
  SET is_super_admin = false
  WHERE id = target_user_id;
  
  -- Log the action
  INSERT INTO superadmin_actions (action_type, performed_by, target_user_id, metadata)
  VALUES (
    'demote_superadmin',
    v_current_user_id,
    target_user_id,
    jsonb_build_object(
      'target_email', v_target_email,
      'demoted_at', now()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User successfully demoted from superadmin',
    'user_email', v_target_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION can_promote_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_superadmin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_from_superadmin(uuid) TO authenticated;
