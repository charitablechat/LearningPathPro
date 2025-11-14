# Database Setup - Quick Start

## Overview

Your Supabase database needs to be initialized before you can use the application. This folder contains all the SQL scripts you need to copy and paste into your Supabase SQL Editor.

## Files You Need

### 1. START HERE: Complete Guide
**File:** `COMPLETE_DATABASE_SETUP_GUIDE.md`
- Master guide with navigation
- Instructions for all sections
- Troubleshooting tips
- Verification queries

### 2. Section A: Core LMS Schema
**File:** `SUPABASE_DATABASE_SETUP.md`
- Creates profiles, courses, modules, lessons, enrollments, lesson_progress
- Sets up RLS policies and triggers
- **Run this FIRST**

### 3. Section B: Multi-Tenant Features
**File:** `SUPABASE_SETUP_SECTION_B.md`
- Adds is_super_admin field to profiles (**CRITICAL**)
- Creates organizations and subscriptions
- **Run this SECOND**

### 4. Sections C & D: Storage and Superadmin
**File:** `SUPABASE_SETUP_SECTION_C_D.md`
- Creates storage buckets for files
- Sets up superadmin auto-designation for mydogkenna@gmail.com
- **Run this THIRD**

## Quick Setup Steps

1. Open `COMPLETE_DATABASE_SETUP_GUIDE.md`
2. Follow the instructions in order
3. Copy SQL from each section file
4. Paste into Supabase SQL Editor
5. Run and verify each section
6. Sign up with mydogkenna@gmail.com
7. You're done!

## What Gets Created

### Tables (16+)
- profiles (with is_super_admin field)
- courses, modules, lessons
- enrollments, lesson_progress
- organizations
- subscription_plans, subscriptions
- promo_codes, promo_code_redemptions
- organization_invitations
- organization_usage_logs
- superadmin_actions
- legal_acceptance_log (for terms tracking)

### Storage Buckets (3)
- course-videos (500MB limit)
- course-images (10MB limit)
- course-documents (50MB limit)

### Triggers & Functions
- Auto-create profile on signup
- Auto-set superadmin for mydogkenna@gmail.com
- Updated_at triggers for all tables
- Promote/demote superadmin functions

### Security
- RLS enabled on ALL tables
- Restrictive policies by default
- Superadmin bypass for platform management
- Audit logging for superadmin actions

## The Superadmin Magic

When you sign up with `mydogkenna@gmail.com`:
1. A profile is automatically created (via trigger)
2. The `is_super_admin` field is automatically set to `true` (via trigger)
3. You get full platform access immediately
4. The action is logged in `superadmin_actions` table

## Verification

After running all sections, verify everything with:

```sql
-- Check table count
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- Check is_super_admin field exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'is_super_admin';

-- Check superadmin trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'auto_set_superadmin_trigger';
```

## Need Help?

- Review `COMPLETE_DATABASE_SETUP_GUIDE.md` for detailed troubleshooting
- Check Supabase Dashboard logs for error messages
- Verify your project is not paused (free tier limitation)
- Ensure .env file has correct Supabase credentials

## Time to Complete

- Section A: ~2 minutes
- Section B: ~3 minutes
- Section C: ~1 minute
- Section D: ~2 minutes
- **Total: ~8-10 minutes**

Start with `COMPLETE_DATABASE_SETUP_GUIDE.md` and follow along!
