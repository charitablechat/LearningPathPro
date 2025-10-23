/*
  # BR Learning LMS Database Schema

  ## Overview
  Complete schema for the BR Learning Learning Management System with full authentication and course management.

  ## 1. New Tables

  ### `profiles`
  User profile information linked to Supabase auth.users
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique, required) - User email address
  - `full_name` (text) - User's full name
  - `role` (text, required) - User role: 'learner', 'instructor', or 'admin'
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `courses`
  Course information created by instructors
  - `id` (uuid, primary key) - Unique course identifier
  - `title` (text, required) - Course title
  - `description` (text) - Course description
  - `instructor_id` (uuid) - References profiles.id
  - `thumbnail_url` (text) - Course thumbnail image
  - `is_published` (boolean) - Publication status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `modules`
  Course modules (sections/chapters)
  - `id` (uuid, primary key) - Unique module identifier
  - `course_id` (uuid, required) - References courses.id
  - `title` (text, required) - Module title
  - `description` (text) - Module description
  - `order_index` (integer, required) - Display order
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `lessons`
  Individual lessons within modules
  - `id` (uuid, primary key) - Unique lesson identifier
  - `module_id` (uuid, required) - References modules.id
  - `title` (text, required) - Lesson title
  - `content` (text) - Lesson content/description
  - `content_type` (text, required) - Type: 'video', 'pdf', 'document', 'quiz', or 'text'
  - `content_url` (text) - URL to content resource
  - `duration_minutes` (integer) - Estimated duration
  - `order_index` (integer, required) - Display order
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `enrollments`
  Student course enrollments
  - `id` (uuid, primary key) - Unique enrollment identifier
  - `user_id` (uuid, required) - References profiles.id
  - `course_id` (uuid, required) - References courses.id
  - `enrolled_at` (timestamptz) - Enrollment timestamp
  - `completed_at` (timestamptz) - Completion timestamp (null if not completed)
  - `progress_percentage` (integer) - Overall course progress (0-100)

  ### `lesson_progress`
  Individual lesson completion tracking
  - `id` (uuid, primary key) - Unique progress identifier
  - `user_id` (uuid, required) - References profiles.id
  - `lesson_id` (uuid, required) - References lessons.id
  - `is_completed` (boolean) - Completion status
  - `completed_at` (timestamptz) - Completion timestamp
  - `time_spent_minutes` (integer) - Time spent on lesson
  - `created_at` (timestamptz) - First access timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security (Row Level Security)

  All tables have RLS enabled with restrictive policies.

  ## 3. Important Notes
  - All tables use UUID primary keys with automatic generation
  - Timestamps are automatically managed with defaults and triggers
  - Foreign keys enforce referential integrity with CASCADE deletes
  - Unique constraints prevent duplicate enrollments and progress records
  - RLS policies ensure data security at the database level
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'instructor', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  instructor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  thumbnail_url text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  TO authenticated
  USING (
    is_published = true OR
    instructor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Instructors and admins can create courses" ON courses;
CREATE POLICY "Instructors and admins can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
  );

DROP POLICY IF EXISTS "Course instructors and admins can update courses" ON courses;
CREATE POLICY "Course instructors and admins can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    instructor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    instructor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete courses" ON courses;
CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Modules viewable if course is accessible" ON modules;
CREATE POLICY "Modules viewable if course is accessible"
  ON modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND (
        courses.is_published = true OR
        courses.instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Course instructors and admins can manage modules" ON modules;
CREATE POLICY "Course instructors and admins can manage modules"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND (
        courses.instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND (
        courses.instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  content_type text NOT NULL CHECK (content_type IN ('video', 'pdf', 'document', 'quiz', 'text')),
  content_url text,
  duration_minutes integer DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lessons viewable if course is accessible" ON lessons;
CREATE POLICY "Lessons viewable if course is accessible"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND (
        courses.is_published = true OR
        courses.instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Course instructors and admins can manage lessons" ON lessons;
CREATE POLICY "Course instructors and admins can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND (
        courses.instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND (
        courses.instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  UNIQUE(user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can enroll in published courses" ON enrollments;
CREATE POLICY "Users can enroll in published courses"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND is_published = true)
  );

DROP POLICY IF EXISTS "Users can update own enrollment progress" ON enrollments;
CREATE POLICY "Users can update own enrollment progress"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  time_spent_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lesson progress" ON lesson_progress;
CREATE POLICY "Users can view own lesson progress"
  ON lesson_progress FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_progress.lesson_id
      AND courses.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can manage own lesson progress" ON lesson_progress;
CREATE POLICY "Users can manage own lesson progress"
  ON lesson_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
  CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
  CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
  CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
  CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;