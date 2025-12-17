/*
  # Fix Security and Performance Issues
  
  This migration addresses critical security and performance issues identified by Supabase security advisor.
  
  ## Changes Made
  
  ### 1. Add Missing Foreign Key Indexes
  Creates indexes for all foreign keys that were missing covering indexes to improve query performance:
  - content_versions: changed_by
  - courses: cloned_from_id, instructor_id, reviewed_by
  - enrollments: course_id
  - lesson_progress: lesson_id, organization_id
  - lessons: module_id, organization_id
  - modules: course_id, organization_id
  - organization_announcements: created_by
  - organization_invitations: invited_by, organization_id
  - organization_usage_logs: organization_id
  - promo_code_redemptions: organization_id, redeemed_by
  - subscriptions: plan_id
  - superadmin_actions: target_organization_id
  
  ### 2. Optimize RLS Policies for Performance
  Recreates all RLS policies to use `(select auth.uid())` pattern instead of `auth.uid()`.
  This prevents re-evaluation of auth functions for each row, dramatically improving performance at scale.
  
  ### 3. Fix Function Security
  Updates all functions to use immutable search paths, preventing potential security vulnerabilities.
  
  ### 4. Consolidate Duplicate RLS Policies
  Removes redundant policies where multiple permissive policies exist for the same action.
*/

-- ================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_content_versions_changed_by ON public.content_versions(changed_by);
CREATE INDEX IF NOT EXISTS idx_courses_cloned_from_id ON public.courses(cloned_from_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_reviewed_by ON public.courses(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_organization_id ON public.lesson_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_organization_id ON public.lessons(organization_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_organization_id ON public.modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_announcements_created_by ON public.organization_announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_invited_by ON public.organization_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON public.organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_usage_logs_organization_id ON public.organization_usage_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_organization_id ON public.promo_code_redemptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_redeemed_by ON public.promo_code_redemptions(redeemed_by);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_actions_target_organization_id ON public.superadmin_actions(target_organization_id);

-- ================================================
-- PART 2: OPTIMIZE RLS POLICIES
-- ================================================

-- Drop and recreate all RLS policies with optimized auth function calls

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

-- COURSES TABLE
DROP POLICY IF EXISTS "Admins and course instructors can delete courses" ON public.courses;
DROP POLICY IF EXISTS "Admins and course instructors can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
DROP POLICY IF EXISTS "Course instructors and admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors and admins can create courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors and admins can create courses in their organization" ON public.courses;
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Users can view courses in their organization" ON public.courses;

CREATE POLICY "Instructors and admins can create courses in their organization"
  ON public.courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.organization_id = courses.organization_id
      AND profiles.role IN ('instructor', 'admin')
    )
  );

CREATE POLICY "Users can view courses in their organization"
  ON public.courses FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
    OR status = 'published'
  );

CREATE POLICY "Admins and course instructors can update courses"
  ON public.courses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.organization_id = courses.organization_id
      AND (profiles.role = 'admin' OR (profiles.role = 'instructor' AND courses.instructor_id = (select auth.uid())))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.organization_id = courses.organization_id
      AND (profiles.role = 'admin' OR (profiles.role = 'instructor' AND courses.instructor_id = (select auth.uid())))
    )
  );

CREATE POLICY "Admins and course instructors can delete courses"
  ON public.courses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.organization_id = courses.organization_id
      AND (profiles.role = 'admin' OR (profiles.role = 'instructor' AND courses.instructor_id = (select auth.uid())))
    )
  );

-- MODULES TABLE
DROP POLICY IF EXISTS "Course instructors and admins can manage modules" ON public.modules;
DROP POLICY IF EXISTS "Instructors and admins can create modules" ON public.modules;
DROP POLICY IF EXISTS "Instructors and admins can delete modules" ON public.modules;
DROP POLICY IF EXISTS "Instructors and admins can update modules" ON public.modules;
DROP POLICY IF EXISTS "Modules viewable if course is accessible" ON public.modules;
DROP POLICY IF EXISTS "Users can view modules in their organization courses" ON public.modules;

CREATE POLICY "Instructors and admins can create modules"
  ON public.modules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.courses c ON c.id = modules.course_id
      WHERE p.id = (select auth.uid())
      AND p.organization_id = c.organization_id
      AND (p.role = 'admin' OR (p.role = 'instructor' AND c.instructor_id = (select auth.uid())))
    )
  );

CREATE POLICY "Users can view modules in their organization courses"
  ON public.modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.profiles p ON p.organization_id = c.organization_id
      WHERE c.id = modules.course_id
      AND p.id = (select auth.uid())
    )
  );

CREATE POLICY "Instructors and admins can update modules"
  ON public.modules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.courses c ON c.id = modules.course_id
      WHERE p.id = (select auth.uid())
      AND p.organization_id = c.organization_id
      AND (p.role = 'admin' OR (p.role = 'instructor' AND c.instructor_id = (select auth.uid())))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.courses c ON c.id = modules.course_id
      WHERE p.id = (select auth.uid())
      AND p.organization_id = c.organization_id
      AND (p.role = 'admin' OR (p.role = 'instructor' AND c.instructor_id = (select auth.uid())))
    )
  );

CREATE POLICY "Instructors and admins can delete modules"
  ON public.modules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.courses c ON c.id = modules.course_id
      WHERE p.id = (select auth.uid())
      AND p.organization_id = c.organization_id
      AND (p.role = 'admin' OR (p.role = 'instructor' AND c.instructor_id = (select auth.uid())))
    )
  );

-- LESSONS TABLE
DROP POLICY IF EXISTS "Course instructors and admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Instructors and admins can create lessons" ON public.lessons;
DROP POLICY IF EXISTS "Instructors and admins can delete lessons" ON public.lessons;
DROP POLICY IF EXISTS "Instructors and admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Lessons viewable if course is accessible" ON public.lessons;
DROP POLICY IF EXISTS "Users can view lessons in their organization" ON public.lessons;

CREATE POLICY "Instructors and admins can create lessons"
  ON public.lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
      AND p.organization_id = lessons.organization_id
      AND p.role IN ('instructor', 'admin')
    )
  );

CREATE POLICY "Users can view lessons in their organization"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Instructors and admins can update lessons"
  ON public.lessons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
      AND p.organization_id = lessons.organization_id
      AND p.role IN ('instructor', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
      AND p.organization_id = lessons.organization_id
      AND p.role IN ('instructor', 'admin')
    )
  );

CREATE POLICY "Instructors and admins can delete lessons"
  ON public.lessons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
      AND p.organization_id = lessons.organization_id
      AND p.role IN ('instructor', 'admin')
    )
  );

-- ENROLLMENTS TABLE
DROP POLICY IF EXISTS "Admins can delete enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can enroll in published courses" ON public.enrollments;
DROP POLICY IF EXISTS "Users can enroll themselves" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update own enrollment progress" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view enrollments in their organization" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;

CREATE POLICY "Users can enroll themselves"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.courses c ON c.organization_id = p.organization_id
      WHERE p.id = (select auth.uid())
      AND c.id = enrollments.course_id
      AND p.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Users can update their enrollments"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can delete enrollments"
  ON public.enrollments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.courses c ON c.organization_id = p.organization_id
      WHERE p.id = (select auth.uid())
      AND c.id = enrollments.course_id
      AND p.role = 'admin'
    )
  );

-- LESSON_PROGRESS TABLE
DROP POLICY IF EXISTS "Users can create their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can manage own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can view own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can view their own lesson progress" ON public.lesson_progress;

CREATE POLICY "Users can manage own lesson progress"
  ON public.lesson_progress FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ORGANIZATIONS TABLE
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Super admins can delete organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT organization_id FROM public.profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "Organization owners can update their organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Super admins can delete organizations"
  ON public.organizations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_super_admin = true
    )
  );

-- SUBSCRIPTION_PLANS TABLE
DROP POLICY IF EXISTS "Public can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Super admins can manage subscription plans" ON public.subscription_plans;

CREATE POLICY "Public can view active subscription plans"
  ON public.subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Super admins can manage subscription plans"
  ON public.subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_super_admin = true
    )
  );

-- SUBSCRIPTIONS TABLE
DROP POLICY IF EXISTS "Organization owners can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view subscriptions for their organization" ON public.subscriptions;

CREATE POLICY "Users can view subscriptions for their organization"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Organization owners can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE id = subscriptions.organization_id AND owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE id = subscriptions.organization_id AND owner_id = (select auth.uid())
    )
  );

-- PROMO_CODES TABLE
DROP POLICY IF EXISTS "Public can view active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Super admins can manage promo codes" ON public.promo_codes;

CREATE POLICY "Public can view active promo codes"
  ON public.promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Super admins can manage promo codes"
  ON public.promo_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_super_admin = true
    )
  );

-- PROMO_CODE_REDEMPTIONS TABLE
DROP POLICY IF EXISTS "Users can redeem promo codes" ON public.promo_code_redemptions;
DROP POLICY IF EXISTS "Users can view redemptions for their organization" ON public.promo_code_redemptions;

CREATE POLICY "Users can redeem promo codes"
  ON public.promo_code_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (redeemed_by = (select auth.uid()));

CREATE POLICY "Users can view redemptions for their organization"
  ON public.promo_code_redemptions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
  );

-- ORGANIZATION_INVITATIONS TABLE
DROP POLICY IF EXISTS "Invited users can update invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization members can create invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Superadmins can delete invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their organization" ON public.organization_invitations;

CREATE POLICY "Organization members can create invitations"
  ON public.organization_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = organization_invitations.organization_id
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Users can view invitations for their organization"
  ON public.organization_invitations FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
    OR email = (SELECT email FROM auth.users WHERE id = (select auth.uid()))
  );

CREATE POLICY "Invited users can update invitations"
  ON public.organization_invitations FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = (select auth.uid())))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = (select auth.uid())));

CREATE POLICY "Superadmins can delete invitations"
  ON public.organization_invitations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_super_admin = true
    )
  );

-- ORGANIZATION_USAGE_LOGS TABLE
DROP POLICY IF EXISTS "Users can view usage logs for their organization" ON public.organization_usage_logs;

CREATE POLICY "Users can view usage logs for their organization"
  ON public.organization_usage_logs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
  );

-- SUPERADMIN_ACTIONS TABLE
DROP POLICY IF EXISTS "Superadmins can view all audit logs" ON public.superadmin_actions;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.superadmin_actions;

CREATE POLICY "System can insert audit logs"
  ON public.superadmin_actions FOR INSERT
  TO authenticated
  WITH CHECK (performed_by = (select auth.uid()));

CREATE POLICY "Superadmins can view all audit logs"
  ON public.superadmin_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND is_super_admin = true
    )
  );

-- SHARED_LESSONS TABLE
DROP POLICY IF EXISTS "Admins and creators can update shared lessons" ON public.shared_lessons;
DROP POLICY IF EXISTS "Admins and instructors can create shared lessons" ON public.shared_lessons;
DROP POLICY IF EXISTS "Admins can delete shared lessons" ON public.shared_lessons;
DROP POLICY IF EXISTS "Users can view shared lessons in their organization" ON public.shared_lessons;

CREATE POLICY "Admins and instructors can create shared lessons"
  ON public.shared_lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = shared_lessons.organization_id
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Users can view shared lessons in their organization"
  ON public.shared_lessons FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Admins and creators can update shared lessons"
  ON public.shared_lessons FOR UPDATE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = shared_lessons.organization_id
      AND role = 'admin'
    )
  )
  WITH CHECK (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = shared_lessons.organization_id
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete shared lessons"
  ON public.shared_lessons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = shared_lessons.organization_id
      AND role = 'admin'
    )
  );

-- CONTENT_VERSIONS TABLE
DROP POLICY IF EXISTS "Admins and instructors can create content versions" ON public.content_versions;
DROP POLICY IF EXISTS "Users can view content versions in their organization" ON public.content_versions;

CREATE POLICY "Admins and instructors can create content versions"
  ON public.content_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = content_versions.organization_id
      AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Users can view content versions in their organization"
  ON public.content_versions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
  );

-- COURSE_ANALYTICS TABLE
DROP POLICY IF EXISTS "System can manage course analytics" ON public.course_analytics;
DROP POLICY IF EXISTS "Users can view analytics in their organization" ON public.course_analytics;

CREATE POLICY "Users can view analytics in their organization"
  ON public.course_analytics FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "System can manage course analytics"
  ON public.course_analytics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = course_analytics.organization_id
      AND role IN ('admin', 'instructor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = course_analytics.organization_id
      AND role IN ('admin', 'instructor')
    )
  );

-- USER_ACTIVITY_LOGS TABLE
DROP POLICY IF EXISTS "Admins can view user activity logs" ON public.user_activity_logs;

CREATE POLICY "Admins can view user activity logs"
  ON public.user_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = user_activity_logs.organization_id
      AND role = 'admin'
    )
  );

-- ORGANIZATION_ANNOUNCEMENTS TABLE
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.organization_announcements;
DROP POLICY IF EXISTS "Users can view announcements in their organization" ON public.organization_announcements;

CREATE POLICY "Admins can manage announcements"
  ON public.organization_announcements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = organization_announcements.organization_id
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
      AND organization_id = organization_announcements.organization_id
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can view announcements in their organization"
  ON public.organization_announcements FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = (select auth.uid())
    )
  );

-- ================================================
-- PART 3: FIX FUNCTION SECURITY
-- ================================================

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS public.promote_to_superadmin(uuid);
DROP FUNCTION IF EXISTS public.demote_from_superadmin(uuid);
DROP FUNCTION IF EXISTS public.calculate_course_analytics();

-- Recreate functions with secure search paths

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_promo_redemptions()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.promo_codes
  SET redemption_count = redemption_count + 1
  WHERE code = NEW.promo_code;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_set_superadmin_on_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.profiles WHERE is_super_admin = true) = 0 THEN
    NEW.is_super_admin := true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_promote_superadmin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_super_admin = true
  );
END;
$$;

CREATE FUNCTION public.promote_to_superadmin(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT can_promote_superadmin() THEN
    RAISE EXCEPTION 'Only superadmins can promote users';
  END IF;
  
  UPDATE public.profiles
  SET is_super_admin = true
  WHERE id = target_user_id;
  
  INSERT INTO public.superadmin_actions (performed_by, action, target_user_id)
  VALUES (auth.uid(), 'promote_superadmin', target_user_id);
END;
$$;

CREATE FUNCTION public.demote_from_superadmin(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT can_promote_superadmin() THEN
    RAISE EXCEPTION 'Only superadmins can demote users';
  END IF;
  
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  
  UPDATE public.profiles
  SET is_super_admin = false
  WHERE id = target_user_id;
  
  INSERT INTO public.superadmin_actions (performed_by, action, target_user_id)
  VALUES (auth.uid(), 'demote_superadmin', target_user_id);
END;
$$;

CREATE FUNCTION public.calculate_course_analytics()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.course_analytics (
    course_id,
    organization_id,
    total_enrollments,
    active_enrollments,
    completed_enrollments,
    average_progress,
    average_completion_time
  )
  SELECT 
    c.id,
    c.organization_id,
    COUNT(e.id),
    COUNT(e.id) FILTER (WHERE e.status = 'active'),
    COUNT(e.id) FILTER (WHERE e.status = 'completed'),
    AVG(e.progress_percentage),
    AVG(EXTRACT(EPOCH FROM (e.completed_at - e.enrolled_at)) / 86400) FILTER (WHERE e.completed_at IS NOT NULL)
  FROM public.courses c
  LEFT JOIN public.enrollments e ON e.course_id = c.id
  GROUP BY c.id, c.organization_id
  ON CONFLICT (course_id) 
  DO UPDATE SET
    total_enrollments = EXCLUDED.total_enrollments,
    active_enrollments = EXCLUDED.active_enrollments,
    completed_enrollments = EXCLUDED.completed_enrollments,
    average_progress = EXCLUDED.average_progress,
    average_completion_time = EXCLUDED.average_completion_time,
    last_calculated = now();
END;
$$;
