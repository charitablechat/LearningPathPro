/*
  # Admin Platform Control Features

  ## Overview
  Enhance the platform to give admin users (paying customers) complete control over their organization's
  learning platform including course management, content library, templates, and enhanced organization settings.

  ## New Features

  ### 1. Course Management Enhancements
  - Add status field (draft, published, archived)
  - Add is_template flag for course templates
  - Add cloned_from_id to track course duplication
  - Add version tracking

  ### 2. Content Library
  - Add shared_lessons table for reusable content
  - Add content_versions for tracking changes

  ### 3. Organization Enhancements
  - Add custom_domain, logo_url, favicon_url
  - Add email_template_config for custom email branding
  - Add course_access_rules for organization-wide settings

  ### 4. Analytics Tables
  - Add course_analytics for aggregated metrics
  - Add user_activity_logs for tracking engagement

  ## Schema Changes

  1. Courses table additions:
     - status (draft, published, archived)
     - is_template (boolean)
     - cloned_from_id (uuid reference to courses)
     - version_number (integer)
     - approval_status (pending, approved, rejected)
     - reviewed_by (uuid reference to profiles)
     - reviewed_at (timestamptz)

  2. New Tables:
     - shared_lessons: Organization-wide reusable lesson library
     - content_versions: Track content changes
     - course_analytics: Aggregated course metrics
     - user_activity_logs: User engagement tracking
     - organization_announcements: Platform-wide announcements

  ## Security
  - Admins get full read/write access to all organization content
  - RLS policies enforce organization boundaries
  - Super admins maintain platform-wide access
*/

-- Add new columns to courses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'status'
  ) THEN
    ALTER TABLE courses ADD COLUMN status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'is_template'
  ) THEN
    ALTER TABLE courses ADD COLUMN is_template boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'cloned_from_id'
  ) THEN
    ALTER TABLE courses ADD COLUMN cloned_from_id uuid REFERENCES courses(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'version_number'
  ) THEN
    ALTER TABLE courses ADD COLUMN version_number integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE courses ADD COLUMN approval_status text DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE courses ADD COLUMN reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE courses ADD COLUMN reviewed_at timestamptz;
  END IF;
END $$;

-- Create shared_lessons table for organization-wide reusable content
CREATE TABLE IF NOT EXISTS shared_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  content_type text NOT NULL CHECK (content_type IN ('video', 'text', 'pdf', 'quiz', 'document')),
  content_url text,
  duration_minutes integer DEFAULT 10,
  file_size bigint,
  file_type text,
  original_filename text,
  tags text[],
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content_versions table for tracking changes
CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('course', 'module', 'lesson')),
  content_id uuid NOT NULL,
  version_number integer NOT NULL,
  title text NOT NULL,
  content_data jsonb NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  change_description text,
  created_at timestamptz DEFAULT now()
);

-- Create course_analytics table
CREATE TABLE IF NOT EXISTS course_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  total_enrollments integer DEFAULT 0,
  active_enrollments integer DEFAULT 0,
  completion_rate numeric(5,2) DEFAULT 0,
  average_progress numeric(5,2) DEFAULT 0,
  total_time_spent integer DEFAULT 0,
  last_calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id)
);

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  activity_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create organization_announcements table
CREATE TABLE IF NOT EXISTS organization_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  target_audience text NOT NULL CHECK (target_audience IN ('all', 'instructors', 'learners', 'admins')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add enhanced organization fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'favicon_url'
  ) THEN
    ALTER TABLE organizations ADD COLUMN favicon_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'email_template_config'
  ) THEN
    ALTER TABLE organizations ADD COLUMN email_template_config jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'course_access_rules'
  ) THEN
    ALTER TABLE organizations ADD COLUMN course_access_rules jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'settings'
  ) THEN
    ALTER TABLE organizations ADD COLUMN settings jsonb DEFAULT '{}';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_lessons_organization_id ON shared_lessons(organization_id);
CREATE INDEX IF NOT EXISTS idx_shared_lessons_created_by ON shared_lessons(created_by);
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_organization_id ON content_versions(organization_id);
CREATE INDEX IF NOT EXISTS idx_course_analytics_course_id ON course_analytics(course_id);
CREATE INDEX IF NOT EXISTS idx_course_analytics_organization_id ON course_analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_organization_id ON user_activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_organization_announcements_organization_id ON organization_announcements(organization_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_is_template ON courses(is_template);

-- Enable RLS on new tables
ALTER TABLE shared_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_lessons
CREATE POLICY "Users can view shared lessons in their organization"
  ON shared_lessons FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Admins and instructors can create shared lessons"
  ON shared_lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

CREATE POLICY "Admins and creators can update shared lessons"
  ON shared_lessons FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR created_by = auth.uid()
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR created_by = auth.uid()
  );

CREATE POLICY "Admins can delete shared lessons"
  ON shared_lessons FOR DELETE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for content_versions
CREATE POLICY "Users can view content versions in their organization"
  ON content_versions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Admins and instructors can create content versions"
  ON content_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

-- RLS Policies for course_analytics
CREATE POLICY "Users can view analytics in their organization"
  ON course_analytics FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "System can manage course analytics"
  ON course_analytics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_activity_logs
CREATE POLICY "Admins can view user activity logs"
  ON user_activity_logs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "System can insert activity logs"
  ON user_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for organization_announcements
CREATE POLICY "Users can view announcements in their organization"
  ON organization_announcements FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND (published_at IS NULL OR published_at <= now())
    AND (expires_at IS NULL OR expires_at > now())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "Admins can manage announcements"
  ON organization_announcements FOR ALL
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update existing course policies to give admins full access
DROP POLICY IF EXISTS "Instructors and admins can update courses in their organization" ON courses;
CREATE POLICY "Admins and course instructors can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Instructors and admins can delete courses in their organization" ON courses;
CREATE POLICY "Admins and course instructors can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Create triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_shared_lessons_updated_at ON shared_lessons;
CREATE TRIGGER update_shared_lessons_updated_at
  BEFORE UPDATE ON shared_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_analytics_updated_at ON course_analytics;
CREATE TRIGGER update_course_analytics_updated_at
  BEFORE UPDATE ON course_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_announcements_updated_at ON organization_announcements;
CREATE TRIGGER update_organization_announcements_updated_at
  BEFORE UPDATE ON organization_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate course analytics
CREATE OR REPLACE FUNCTION calculate_course_analytics(course_id_param uuid)
RETURNS void AS $$
DECLARE
  org_id uuid;
  total_enroll integer;
  active_enroll integer;
  completion_rate_calc numeric;
  avg_progress_calc numeric;
BEGIN
  SELECT organization_id INTO org_id FROM courses WHERE id = course_id_param;
  
  SELECT COUNT(*) INTO total_enroll FROM enrollments WHERE course_id = course_id_param;
  SELECT COUNT(*) INTO active_enroll FROM enrollments WHERE course_id = course_id_param AND progress < 100;
  
  SELECT AVG(CASE WHEN progress = 100 THEN 1 ELSE 0 END) * 100 INTO completion_rate_calc
  FROM enrollments WHERE course_id = course_id_param;
  
  SELECT AVG(progress) INTO avg_progress_calc FROM enrollments WHERE course_id = course_id_param;
  
  INSERT INTO course_analytics (organization_id, course_id, total_enrollments, active_enrollments, completion_rate, average_progress, last_calculated_at)
  VALUES (org_id, course_id_param, COALESCE(total_enroll, 0), COALESCE(active_enroll, 0), COALESCE(completion_rate_calc, 0), COALESCE(avg_progress_calc, 0), now())
  ON CONFLICT (course_id) DO UPDATE
  SET total_enrollments = EXCLUDED.total_enrollments,
      active_enrollments = EXCLUDED.active_enrollments,
      completion_rate = EXCLUDED.completion_rate,
      average_progress = EXCLUDED.average_progress,
      last_calculated_at = EXCLUDED.last_calculated_at,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
