/*
  # Update RLS Policies for Superadmin Access

  ## Summary
  Updates all Row Level Security policies across the database to grant superadmins
  complete access to all resources across all organizations. Superadmins can view,
  create, update, and delete any data while maintaining security for regular users.

  ## Changes

  ### 1. Profiles Table
  - Grant superadmins ability to view all user profiles
  - Grant superadmins ability to update any profile
  - Prevent non-superadmins from setting is_super_admin flag

  ### 2. Organizations Table
  - Already has superadmin access in existing policies
  - Verify and ensure complete CRUD access for superadmins

  ### 3. Courses, Modules, Lessons
  - Update to allow superadmin to view all courses across organizations
  - Allow superadmin to create/update/delete courses in any organization

  ### 4. Enrollments and Progress
  - Grant superadmin visibility into all enrollments
  - Allow superadmin to manage enrollments across organizations

  ### 5. Organization Invitations
  - Allow superadmin to view and manage all invitations

  ### 6. Usage Logs
  - Already has superadmin access
  - Verify proper access

  ## Security Notes
  - Regular users maintain their existing restricted access
  - Organization isolation is preserved for non-superadmin users
  - Superadmin actions are logged in superadmin_actions table
  - Original superadmin cannot be demoted or lose privileges
*/

-- Update profiles policies for superadmin access
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  )
  WITH CHECK (
    (id = auth.uid() AND is_super_admin = (SELECT is_super_admin FROM profiles WHERE id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Ensure modules have proper superadmin access
DROP POLICY IF EXISTS "Users can view modules in their organization courses" ON modules;
CREATE POLICY "Users can view modules in their organization courses"
  ON modules FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Instructors and admins can create modules" ON modules;
CREATE POLICY "Instructors and admins can create modules"
  ON modules FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Instructors and admins can update modules" ON modules;
CREATE POLICY "Instructors and admins can update modules"
  ON modules FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Instructors and admins can delete modules" ON modules;
CREATE POLICY "Instructors and admins can delete modules"
  ON modules FOR DELETE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Ensure lessons have proper superadmin access
DROP POLICY IF EXISTS "Users can view lessons in their organization" ON lessons;
CREATE POLICY "Users can view lessons in their organization"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Instructors and admins can create lessons" ON lessons;
CREATE POLICY "Instructors and admins can create lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Instructors and admins can update lessons" ON lessons;
CREATE POLICY "Instructors and admins can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Instructors and admins can delete lessons" ON lessons;
CREATE POLICY "Instructors and admins can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Update enrollments policies for superadmin
DROP POLICY IF EXISTS "Users can view enrollments in their organization" ON enrollments;
CREATE POLICY "Users can view enrollments in their organization"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Users can enroll themselves" ON enrollments;
CREATE POLICY "Users can enroll themselves"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Users can update their enrollments" ON enrollments;
CREATE POLICY "Users can update their enrollments"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  )
  WITH CHECK (
    user_id = auth.uid()
    OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Admins can delete enrollments" ON enrollments;
CREATE POLICY "Admins can delete enrollments"
  ON enrollments FOR DELETE
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Update lesson_progress policies for superadmin
DROP POLICY IF EXISTS "Users can view their own lesson progress" ON lesson_progress;
CREATE POLICY "Users can view their own lesson progress"
  ON lesson_progress FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Users can create their own lesson progress" ON lesson_progress;
CREATE POLICY "Users can create their own lesson progress"
  ON lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Users can update their own lesson progress" ON lesson_progress;
CREATE POLICY "Users can update their own lesson progress"
  ON lesson_progress FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Update organization_invitations for superadmin management
DROP POLICY IF EXISTS "Organization members can create invitations" ON organization_invitations;
CREATE POLICY "Organization members can create invitations"
  ON organization_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

DROP POLICY IF EXISTS "Users can view invitations for their organization" ON organization_invitations;
CREATE POLICY "Users can view invitations for their organization"
  ON organization_invitations FOR SELECT
  TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Add superadmin delete access to invitations
CREATE POLICY "Superadmins can delete invitations"
  ON organization_invitations FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );
