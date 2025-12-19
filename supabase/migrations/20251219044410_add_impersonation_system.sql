/*
  # Add Impersonation System for Super Admin Testing

  1. New Tables
    - `impersonation_sessions`
      - `id` (uuid, primary key)
      - `super_admin_id` (uuid, references profiles)
      - `impersonated_user_id` (uuid, references profiles)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz, nullable)
      - `reason` (text, nullable)
      - `is_active` (boolean)

  2. Test Data
    - Create test organization for testing purposes
    - Test users will be created through the application

  3. Security
    - Enable RLS on impersonation_sessions table
    - Only super admins can create impersonation sessions
    - Only super admins can view impersonation sessions
    - Prevent impersonating other super admins

  4. Functions
    - `start_impersonation` - Begin impersonating a user
    - `end_impersonation` - End current impersonation session
    - `get_active_impersonation` - Get current active impersonation for super admin
*/

-- Create impersonation sessions table
CREATE TABLE IF NOT EXISTS impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  impersonated_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  reason text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on impersonation_sessions
ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Super admins can view all impersonation sessions
CREATE POLICY "Super admins can view all impersonation sessions"
  ON impersonation_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- Super admins can create impersonation sessions
CREATE POLICY "Super admins can create impersonation sessions"
  ON impersonation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
    AND super_admin_id = auth.uid()
  );

-- Super admins can update their own impersonation sessions
CREATE POLICY "Super admins can update their own impersonation sessions"
  ON impersonation_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
    AND super_admin_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
    AND super_admin_id = auth.uid()
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_super_admin
  ON impersonation_sessions(super_admin_id, is_active);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_active
  ON impersonation_sessions(is_active, started_at);

-- Function to start impersonation
CREATE OR REPLACE FUNCTION start_impersonation(
  target_user_id uuid,
  impersonation_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id uuid;
  is_super_admin boolean;
  target_is_super_admin boolean;
BEGIN
  -- Check if current user is super admin
  SELECT is_super_admin INTO is_super_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT is_super_admin THEN
    RAISE EXCEPTION 'Only super admins can impersonate users';
  END IF;

  -- Check if target user is a super admin (prevent impersonating super admins)
  SELECT is_super_admin INTO target_is_super_admin
  FROM profiles
  WHERE id = target_user_id;

  IF target_is_super_admin THEN
    RAISE EXCEPTION 'Cannot impersonate other super admins';
  END IF;

  -- End any active impersonation sessions for this super admin
  UPDATE impersonation_sessions
  SET is_active = false, ended_at = now()
  WHERE super_admin_id = auth.uid() AND is_active = true;

  -- Create new impersonation session
  INSERT INTO impersonation_sessions (
    super_admin_id,
    impersonated_user_id,
    reason,
    is_active
  ) VALUES (
    auth.uid(),
    target_user_id,
    impersonation_reason,
    true
  )
  RETURNING id INTO session_id;

  RETURN session_id;
END;
$$;

-- Function to end impersonation
CREATE OR REPLACE FUNCTION end_impersonation()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_super_admin boolean;
BEGIN
  -- Check if current user is super admin
  SELECT is_super_admin INTO is_super_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT is_super_admin THEN
    RAISE EXCEPTION 'Only super admins can end impersonation';
  END IF;

  -- End all active impersonation sessions for this super admin
  UPDATE impersonation_sessions
  SET is_active = false, ended_at = now()
  WHERE super_admin_id = auth.uid() AND is_active = true;

  RETURN true;
END;
$$;

-- Function to get active impersonation
CREATE OR REPLACE FUNCTION get_active_impersonation()
RETURNS TABLE (
  session_id uuid,
  impersonated_user_id uuid,
  impersonated_email text,
  impersonated_full_name text,
  impersonated_role text,
  started_at timestamptz,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.impersonated_user_id,
    p.email,
    p.full_name,
    p.role::text,
    i.started_at,
    i.reason
  FROM impersonation_sessions i
  JOIN profiles p ON p.id = i.impersonated_user_id
  WHERE i.super_admin_id = auth.uid()
    AND i.is_active = true
  ORDER BY i.started_at DESC
  LIMIT 1;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION start_impersonation(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION end_impersonation() TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_impersonation() TO authenticated;
