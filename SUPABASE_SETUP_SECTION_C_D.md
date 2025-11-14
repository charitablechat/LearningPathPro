# SECTION C: Storage Buckets and File Metadata

**What this does:** Creates storage buckets for course videos, images, and documents. Adds file metadata fields to lessons table.

**Copy and paste this entire block:**

```sql
-- ============================================================================
-- SECTION C: Storage Buckets and File Metadata
-- Creates: Storage buckets for course content and file metadata fields
-- ============================================================================

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('course-videos', 'course-videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']),
  ('course-images', 'course-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('course-documents', 'course-documents', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES - PUBLIC READ ACCESS
-- ============================================================================
DROP POLICY IF EXISTS "Public Access for course videos" ON storage.objects;
CREATE POLICY "Public Access for course videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'course-videos');

DROP POLICY IF EXISTS "Public Access for course images" ON storage.objects;
CREATE POLICY "Public Access for course images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'course-images');

DROP POLICY IF EXISTS "Public Access for course documents" ON storage.objects;
CREATE POLICY "Public Access for course documents"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'course-documents');

-- ============================================================================
-- STORAGE POLICIES - AUTHENTICATED UPLOAD
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-videos');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-images');

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-documents');

-- ============================================================================
-- STORAGE POLICIES - UPDATE OWN FILES
-- ============================================================================
DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
CREATE POLICY "Users can update own videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'course-videos' AND owner::text = (auth.uid())::text)
  WITH CHECK (bucket_id = 'course-videos' AND owner::text = (auth.uid())::text);

DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'course-images' AND owner::text = (auth.uid())::text)
  WITH CHECK (bucket_id = 'course-images' AND owner::text = (auth.uid())::text);

DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
CREATE POLICY "Users can update own documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'course-documents' AND owner::text = (auth.uid())::text)
  WITH CHECK (bucket_id = 'course-documents' AND owner::text = (auth.uid())::text);

-- ============================================================================
-- STORAGE POLICIES - DELETE OWN FILES
-- ============================================================================
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
CREATE POLICY "Users can delete own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-videos' AND owner::text = (auth.uid())::text);

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-images' AND owner::text = (auth.uid())::text);

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-documents' AND owner::text = (auth.uid())::text);

-- ============================================================================
-- ADD FILE METADATA FIELDS TO LESSONS
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE lessons ADD COLUMN file_size bigint DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE lessons ADD COLUMN file_type text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'original_filename'
  ) THEN
    ALTER TABLE lessons ADD COLUMN original_filename text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE lessons ADD COLUMN thumbnail_url text DEFAULT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lessons_file_type ON lessons(file_type);
```

**After running, verify with:**
```sql
SELECT id, name, public FROM storage.buckets
WHERE id IN ('course-videos', 'course-images', 'course-documents');
```

You should see 3 storage buckets listed.

---

# SECTION D: Superadmin Setup (CRITICAL)

**What this does:** Creates the automatic superadmin designation system. When you sign up with `mydogkenna@gmail.com`, you will automatically become a superadmin.

**Copy and paste this entire block:**

```sql
-- ============================================================================
-- SECTION D: Superadmin Auto-Designation System
-- CRITICAL: This enables mydogkenna@gmail.com to become superadmin on signup
-- ============================================================================

-- ============================================================================
-- SUPERADMIN ACTIONS AUDIT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS superadmin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  performed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_superadmin_actions_performed_by ON superadmin_actions(performed_by);
CREATE INDEX IF NOT EXISTS idx_superadmin_actions_target_user ON superadmin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_actions_created_at ON superadmin_actions(created_at DESC);

ALTER TABLE superadmin_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmins can view all audit logs" ON superadmin_actions;
CREATE POLICY "Superadmins can view all audit logs"
  ON superadmin_actions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

DROP POLICY IF EXISTS "System can insert audit logs" ON superadmin_actions;
CREATE POLICY "System can insert audit logs"
  ON superadmin_actions FOR INSERT
  TO authenticated
  WITH CHECK (performed_by = auth.uid() OR performed_by IS NULL);

-- ============================================================================
-- SET EXISTING mydogkenna@gmail.com PROFILE AS SUPERADMIN (IF EXISTS)
-- ============================================================================
DO $$
DECLARE
  v_profile_id uuid;
BEGIN
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE email = 'mydogkenna@gmail.com'
  LIMIT 1;

  IF v_profile_id IS NOT NULL THEN
    UPDATE profiles
    SET is_super_admin = true
    WHERE id = v_profile_id;

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

-- ============================================================================
-- AUTO-SET SUPERADMIN ON SIGNUP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_set_superadmin_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'mydogkenna@gmail.com' AND (NEW.is_super_admin IS NULL OR NEW.is_super_admin = false) THEN
    NEW.is_super_admin = true;

    PERFORM pg_notify('superadmin_designated', NEW.id::text);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_set_superadmin_trigger ON profiles;
CREATE TRIGGER auto_set_superadmin_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_superadmin_on_signup();

-- ============================================================================
-- SUPERADMIN HELPER FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION can_promote_superadmin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION promote_to_superadmin(target_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_current_user_id uuid;
  v_target_email text;
BEGIN
  v_current_user_id := auth.uid();

  IF NOT can_promote_superadmin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only superadmins can promote users to superadmin'
    );
  END IF;

  SELECT email INTO v_target_email
  FROM profiles
  WHERE id = target_user_id;

  IF v_target_email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target user not found'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND is_super_admin = true) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is already a superadmin'
    );
  END IF;

  UPDATE profiles
  SET is_super_admin = true
  WHERE id = target_user_id;

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

CREATE OR REPLACE FUNCTION demote_from_superadmin(target_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_current_user_id uuid;
  v_target_email text;
BEGIN
  v_current_user_id := auth.uid();

  IF NOT can_promote_superadmin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only superadmins can demote superadmins'
    );
  END IF;

  SELECT email INTO v_target_email
  FROM profiles
  WHERE id = target_user_id;

  IF v_target_email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target user not found'
    );
  END IF;

  IF v_target_email = 'mydogkenna@gmail.com' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot demote the original platform superadmin'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND is_super_admin = true) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is not a superadmin'
    );
  END IF;

  UPDATE profiles
  SET is_super_admin = false
  WHERE id = target_user_id;

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

GRANT EXECUTE ON FUNCTION can_promote_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_superadmin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_from_superadmin(uuid) TO authenticated;
```

**After running, verify with:**
```sql
-- Check that superadmin_actions table exists
SELECT table_name FROM information_schema.tables
WHERE table_name = 'superadmin_actions';

-- Check that the trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'auto_set_superadmin_trigger';

-- Check that helper functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_name IN ('can_promote_superadmin', 'promote_to_superadmin', 'demote_from_superadmin');
```

All three queries should return results confirming everything is set up.

---

# FINAL STEP: Sign Up as Superadmin

Now that the database is fully set up, you can sign up:

1. Go to your application's signup page
2. Sign up with:
   - Email: `mydogkenna@gmail.com`
   - Full Name: Your preferred name
   - Password: Your secure password
3. The trigger will automatically set `is_super_admin = true` on your profile
4. After signing up, verify your superadmin status:

```sql
SELECT id, email, full_name, is_super_admin, role, created_at
FROM profiles
WHERE email = 'mydogkenna@gmail.com';
```

The `is_super_admin` column should show `true`.

---

# Troubleshooting

If you encounter any errors:

1. **Foreign key constraint errors**: Make sure you ran Section A before Section B
2. **Table already exists errors**: These are safe to ignore if using `IF NOT EXISTS`
3. **Policy already exists errors**: The scripts use `DROP POLICY IF EXISTS` so this shouldn't happen
4. **Trigger function not found**: Make sure Section A was completed successfully

If something goes wrong, you can start fresh by running:
```sql
-- WARNING: This will delete ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then run all sections again from Section A.

---

# Summary

You've successfully set up:
- Core LMS tables (profiles, courses, modules, lessons, enrollments, lesson_progress)
- Multi-tenant features (organizations, subscriptions, promo codes)
- Storage buckets for course content
- Superadmin auto-designation system for mydogkenna@gmail.com
- All RLS policies and security measures

Your database is now ready for production use!
