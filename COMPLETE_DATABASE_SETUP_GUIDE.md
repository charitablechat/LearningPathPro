# Complete Supabase Database Setup Guide

## Quick Navigation

This guide is split into easy-to-copy sections. Follow these steps in order:

1. [Section A: Core LMS Schema](#section-a-core-lms-schema) - Base tables and authentication
2. [Section B: Multi-Tenant Features](#section-b-multi-tenant-features) - Organizations and subscriptions
3. [Section C: Storage Buckets](#section-c-storage-buckets) - File upload system
4. [Section D: Superadmin Setup](#section-d-superadmin-setup) - **CRITICAL** for mydogkenna@gmail.com

---

## How to Use This Guide

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your "ClearCourseStudio" project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"
5. For each section below:
   - Copy the ENTIRE SQL code block
   - Paste into SQL Editor
   - Click "Run" or press CMD+Enter (Mac) / CTRL+Enter (Windows)
   - Wait for "Success" message
   - Run the verification query provided
   - Move to next section

---

## Section A: Core LMS Schema

**File:** See `SUPABASE_DATABASE_SETUP.md`

This section creates:
- profiles table (with automatic creation on signup)
- courses table
- modules table
- lessons table
- enrollments table
- lesson_progress table
- All RLS policies
- Updated_at triggers
- Profile auto-creation trigger

**Expected Result:** 6 tables created with full security policies

---

## Section B: Multi-Tenant Features

**File:** See `SUPABASE_SETUP_SECTION_B.md`

This section creates:
- is_super_admin field on profiles (**REQUIRED** for superadmin functionality)
- organizations table
- subscription_plans table
- subscriptions table
- promo_codes table
- promo_code_redemptions table
- organization_invitations table
- organization_usage_logs table
- Default subscription plans
- LTD promo code

**Expected Result:** 7 new tables + is_super_admin field added to profiles

---

## Section C: Storage Buckets

**File:** See `SUPABASE_SETUP_SECTION_C_D.md` (first half)

This section creates:
- course-videos storage bucket (500MB limit)
- course-images storage bucket (10MB limit)
- course-documents storage bucket (50MB limit)
- File metadata fields on lessons table
- All storage RLS policies

**Expected Result:** 3 storage buckets with public read access

---

## Section D: Superadmin Setup

**File:** See `SUPABASE_SETUP_SECTION_C_D.md` (second half)

This section creates:
- superadmin_actions audit table
- Auto-designation trigger for mydogkenna@gmail.com
- Helper functions (promote/demote superadmin)
- Audit logging system

**Expected Result:** When you sign up with mydogkenna@gmail.com, you automatically become a superadmin

---

## After Running All Sections

### Verify Complete Setup

Run this comprehensive verification query:

```sql
SELECT
  'Tables' as check_type,
  COUNT(*) as count,
  'Expected: 16+' as expected
FROM information_schema.tables
WHERE table_schema = 'public'

UNION ALL

SELECT
  'Storage Buckets' as check_type,
  COUNT(*) as count,
  'Expected: 3' as expected
FROM storage.buckets
WHERE id IN ('course-videos', 'course-images', 'course-documents')

UNION ALL

SELECT
  'Triggers' as check_type,
  COUNT(*) as count,
  'Expected: 2+' as expected
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'auto_set_superadmin_trigger')

UNION ALL

SELECT
  'is_super_admin field' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_super_admin'
  ) THEN 1 ELSE 0 END as count,
  'Expected: 1' as expected;
```

All counts should match expected values.

---

## Sign Up as Superadmin

1. Go to your application at https://clearcourse.studio (or your local URL)
2. Click "Sign Up" or navigate to the signup page
3. Enter:
   - **Email:** mydogkenna@gmail.com
   - **Full Name:** Jack Reacher (or your preferred name)
   - **Password:** Your secure password
4. Submit the form
5. The trigger will automatically set is_super_admin = true

### Verify Superadmin Status

After signing up, run this query:

```sql
SELECT
  id,
  email,
  full_name,
  is_super_admin,
  role,
  organization_id,
  created_at
FROM profiles
WHERE email = 'mydogkenna@gmail.com';
```

**Expected output:**
- is_super_admin: `true`
- role: `learner` (default, you can change this)
- email: `mydogkenna@gmail.com`

---

## Common Issues and Solutions

### Issue: "relation profiles does not exist"
**Solution:** You skipped Section A. Run Section A first.

### Issue: "column is_super_admin does not exist"
**Solution:** You skipped Section B. Run Section B to add the is_super_admin field.

### Issue: "trigger auto_set_superadmin_trigger does not exist"
**Solution:** You skipped Section D. Run Section D to create the superadmin trigger.

### Issue: "Foreign key violation on organizations.owner_id"
**Solution:** Run sections in order. Section B requires Section A to be complete.

### Issue: Signed up but is_super_admin is still false
**Solution:**
1. Check if trigger exists:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'auto_set_superadmin_trigger';
   ```
2. If trigger doesn't exist, run Section D
3. If trigger exists, manually update:
   ```sql
   UPDATE profiles
   SET is_super_admin = true
   WHERE email = 'mydogkenna@gmail.com';
   ```

---

## Start Fresh (Nuclear Option)

If something goes very wrong and you need to start over:

```sql
-- WARNING: This deletes EVERYTHING in your database
-- Only use if you're sure you want to start fresh
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;
```

Then run all sections again from A to D.

---

## What's Next?

After successfully setting up your database and creating your superadmin account:

1. **Test Login:** Try logging in with mydogkenna@gmail.com
2. **Access SuperAdmin Dashboard:** Navigate to /superadmin (if that route exists)
3. **Create an Organization:** Test the organization creation flow
4. **Create a Course:** Test the course builder
5. **Invite Users:** Test the invitation system

---

## Files Reference

All SQL scripts are available in these files:
- `SUPABASE_DATABASE_SETUP.md` - Section A (Core Schema)
- `SUPABASE_SETUP_SECTION_B.md` - Section B (Multi-Tenant)
- `SUPABASE_SETUP_SECTION_C_D.md` - Sections C & D (Storage & Superadmin)

You can open these files to view and copy the complete SQL scripts.

---

## Support

If you encounter issues not covered in this guide:

1. Check the Supabase logs in the Dashboard
2. Verify all migrations ran successfully
3. Check that your .env file has correct Supabase credentials
4. Ensure your Supabase project is on the correct plan (not paused)

Your database schema is now complete and production-ready!
