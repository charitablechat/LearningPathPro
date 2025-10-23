/*
  # Grant Admins Full Access to All Resources

  ## Overview
  This migration updates all RLS policies to ensure administrators have complete
  access to all courses, modules, lessons, enrollments, lesson progress, and storage.

  ## Changes Made

  ### 1. Courses Table
  - Admins can view ALL courses (published or unpublished)
  - Admins can create, update, and delete any course

  ### 2. Modules Table
  - Admins can view all modules regardless of course visibility
  - Admins can create, update, and delete any module

  ### 3. Lessons Table
  - Admins can view all lessons regardless of course visibility
  - Admins can create, update, and delete any lesson

  ### 4. Enrollments Table
  - Admins can view all enrollments across all courses
  - Already has proper admin access

  ### 5. Lesson Progress Table
  - Admins can view all lesson progress across all users
  - Already has proper admin access

  ### 6. Storage Policies
  - Admins can update and delete any files in storage buckets
  - Added new policies for admin file management

  ## Security Notes
  - Admin role is checked via the profiles table
  - All policies properly verify auth.uid() and role = 'admin'
  - Maintains existing security for non-admin users
*/

-- Update courses SELECT policy to ensure admins see ALL courses
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  TO authenticated
  USING (
    is_published = true OR
    instructor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update modules SELECT policy to ensure admins see ALL modules
DROP POLICY IF EXISTS "Modules viewable if course is accessible" ON modules;
CREATE POLICY "Modules viewable if course is accessible"
  ON modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND (
        courses.is_published = true OR
        courses.instructor_id = auth.uid()
      )
    )
  );

-- Update modules management policy to ensure admins can manage ALL modules
DROP POLICY IF EXISTS "Course instructors and admins can manage modules" ON modules;
CREATE POLICY "Course instructors and admins can manage modules"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Update lessons SELECT policy to ensure admins see ALL lessons
DROP POLICY IF EXISTS "Lessons viewable if course is accessible" ON lessons;
CREATE POLICY "Lessons viewable if course is accessible"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND (
        courses.is_published = true OR
        courses.instructor_id = auth.uid()
      )
    )
  );

-- Update lessons management policy to ensure admins can manage ALL lessons
DROP POLICY IF EXISTS "Course instructors and admins can manage lessons" ON lessons;
CREATE POLICY "Course instructors and admins can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND courses.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Add admin access to storage objects for updates
DROP POLICY IF EXISTS "Admins can update any videos" ON storage.objects;
CREATE POLICY "Admins can update any videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'course-videos' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    bucket_id = 'course-videos' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update any images" ON storage.objects;
CREATE POLICY "Admins can update any images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'course-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    bucket_id = 'course-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update any documents" ON storage.objects;
CREATE POLICY "Admins can update any documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'course-documents' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    bucket_id = 'course-documents' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add admin access to storage objects for deletes
DROP POLICY IF EXISTS "Admins can delete any videos" ON storage.objects;
CREATE POLICY "Admins can delete any videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'course-videos' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete any images" ON storage.objects;
CREATE POLICY "Admins can delete any images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'course-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete any documents" ON storage.objects;
CREATE POLICY "Admins can delete any documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'course-documents' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
