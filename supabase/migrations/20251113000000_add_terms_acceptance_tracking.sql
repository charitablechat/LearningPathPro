/*
  # Add Terms Acceptance Tracking

  1. Changes to profiles table
    - Add `terms_accepted_at` column to track when user accepted terms
    - Add `privacy_accepted_at` column to track when user accepted privacy policy
    - Add `terms_version` column to track which version was accepted
    - Add `marketing_emails_consent` column for marketing opt-in

  2. Security
    - Users can only update their own acceptance records
    - Records are immutable once set (can only be updated, not deleted)
*/

-- Add terms acceptance tracking columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'terms_accepted_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN terms_accepted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'privacy_accepted_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN privacy_accepted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'terms_version'
  ) THEN
    ALTER TABLE profiles ADD COLUMN terms_version text DEFAULT '1.0';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'marketing_emails_consent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN marketing_emails_consent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_terms_notification'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_terms_notification timestamptz;
  END IF;
END $$;

-- Create audit log table for legal compliance tracking
CREATE TABLE IF NOT EXISTS legal_acceptance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('terms', 'privacy', 'cookies', 'marketing')),
  document_version text NOT NULL,
  accepted_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  UNIQUE(user_id, document_type, document_version)
);

-- Enable RLS on legal_acceptance_log
ALTER TABLE legal_acceptance_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own acceptance log
CREATE POLICY "Users can view own acceptance log"
  ON legal_acceptance_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own acceptance records
CREATE POLICY "Users can insert own acceptance records"
  ON legal_acceptance_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Super admins can view all acceptance logs for compliance
CREATE POLICY "Super admins can view all acceptance logs"
  ON legal_acceptance_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- Create function to update profile terms acceptance
CREATE OR REPLACE FUNCTION accept_legal_terms(
  p_terms_accepted boolean DEFAULT false,
  p_privacy_accepted boolean DEFAULT false,
  p_marketing_consent boolean DEFAULT false,
  p_version text DEFAULT '1.0'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profile with acceptance timestamps
  IF p_terms_accepted THEN
    UPDATE profiles
    SET
      terms_accepted_at = now(),
      terms_version = p_version
    WHERE id = auth.uid();

    -- Log the acceptance
    INSERT INTO legal_acceptance_log (user_id, document_type, document_version)
    VALUES (auth.uid(), 'terms', p_version)
    ON CONFLICT (user_id, document_type, document_version) DO NOTHING;
  END IF;

  IF p_privacy_accepted THEN
    UPDATE profiles
    SET privacy_accepted_at = now()
    WHERE id = auth.uid();

    -- Log the acceptance
    INSERT INTO legal_acceptance_log (user_id, document_type, document_version)
    VALUES (auth.uid(), 'privacy', p_version)
    ON CONFLICT (user_id, document_type, document_version) DO NOTHING;
  END IF;

  -- Update marketing consent
  UPDATE profiles
  SET marketing_emails_consent = p_marketing_consent
  WHERE id = auth.uid();

  IF p_marketing_consent THEN
    INSERT INTO legal_acceptance_log (user_id, document_type, document_version)
    VALUES (auth.uid(), 'marketing', p_version)
    ON CONFLICT (user_id, document_type, document_version) DO NOTHING;
  END IF;
END;
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_legal_acceptance_user_id ON legal_acceptance_log(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_acceptance_document_type ON legal_acceptance_log(document_type);
CREATE INDEX IF NOT EXISTS idx_profiles_terms_accepted ON profiles(terms_accepted_at) WHERE terms_accepted_at IS NOT NULL;

COMMENT ON TABLE legal_acceptance_log IS 'Audit log for tracking user acceptance of legal documents for compliance';
COMMENT ON FUNCTION accept_legal_terms IS 'Function to record user acceptance of terms, privacy policy, and marketing consent';
