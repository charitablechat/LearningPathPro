/*
  # Email Notifications Tracking Schema

  1. New Tables
    - `email_notifications`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `user_id` (uuid, references auth.users)
      - `email_type` (text) - Type of email sent (welcome, subscription_activated, payment_failed, trial_ending, etc.)
      - `recipient_email` (text) - Email address where notification was sent
      - `subject` (text) - Email subject line
      - `status` (text) - Status: pending, sent, failed, bounced
      - `sent_at` (timestamptz) - When email was successfully sent
      - `failed_at` (timestamptz) - When email failed
      - `error_message` (text) - Error details if failed
      - `metadata` (jsonb) - Additional context (template variables, etc.)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Index on organization_id for quick lookups
    - Index on user_id for user-specific queries
    - Index on email_type for analytics
    - Index on status for monitoring
    - Index on created_at for time-based queries

  3. Security
    - Enable RLS on `email_notifications` table
    - Allow authenticated users to read their own notifications
    - Allow service role to insert and update notifications
    - Super admins can view all notifications
*/

CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at timestamptz,
  failed_at timestamptz,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_notifications_organization_id ON email_notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_email_type ON email_notifications(email_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at DESC);

ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email notifications"
  ON email_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert email notifications"
  ON email_notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update email notifications"
  ON email_notifications FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can view all email notifications"
  ON email_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

CREATE TRIGGER update_email_notifications_updated_at
  BEFORE UPDATE ON email_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
