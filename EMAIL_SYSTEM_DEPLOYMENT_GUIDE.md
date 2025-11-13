# Email Notification System - Deployment Guide

## Overview
This guide will help you deploy and activate the complete email notification system for My AI Summit.

## Prerequisites
1. Resend account (sign up at https://resend.com)
2. Verified domain: myaisummit.digital in Resend
3. Supabase project access
4. Supabase CLI installed (optional for deployment)

---

## Step 1: Configure Resend Email Provider

### 1.1 Get Resend API Key
1. Log in to your Resend dashboard: https://resend.com/login
2. Navigate to **API Keys** section
3. Create a new API key or copy your existing one
4. Save this key securely - you'll need it in the next step

### 1.2 Verify Domain in Resend
1. In Resend dashboard, go to **Domains**
2. Add domain: `myaisummit.digital`
3. Follow Resend's instructions to add DNS records:
   - SPF record
   - DKIM records
   - Return-Path (optional but recommended)
4. Wait for verification (usually 5-30 minutes)

### 1.3 Configure Sender Email
Once domain is verified, you can send from: `admin@myaisummit.digital`

---

## Step 2: Configure Supabase Environment Variables

### 2.1 Add Environment Variables to Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add the following secrets:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx  # Your Resend API key from Step 1.1
EMAIL_FROM=admin@myaisummit.digital
```

**Important**: Without these environment variables, emails will only be logged to console (development mode).

---

## Step 3: Apply Database Migration

### Option A: Using Supabase Dashboard (Recommended)
1. Go to **Database** → **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of:
   `/supabase/migrations/20251113000002_create_email_notifications_tracking.sql`
4. Click **Run** to execute the migration
5. Verify the `email_notifications` table was created in **Database** → **Tables**

### Option B: Using Supabase CLI
```bash
# Navigate to project directory
cd /path/to/project

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push
```

### Verify Migration Success
Run this query in SQL Editor to confirm:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_notifications';
```

---

## Step 4: Deploy Edge Functions

You have **3 Edge Functions** to deploy:

### 4.1 Deploy send-email Function
```bash
# Using Supabase CLI
supabase functions deploy send-email

# Or manually through Supabase Dashboard:
# 1. Go to Edge Functions → Create new function
# 2. Name: send-email
# 3. Copy contents from: /supabase/functions/send-email/index.ts
# 4. Deploy
```

### 4.2 Deploy Updated stripe-webhook Function
```bash
# Using Supabase CLI
supabase functions deploy stripe-webhook

# Or manually update existing function in dashboard
# Copy contents from: /supabase/functions/stripe-webhook/index.ts
```

### 4.3 Deploy trial-ending-notifications Function
```bash
# Using Supabase CLI
supabase functions deploy trial-ending-notifications

# Or manually through Supabase Dashboard:
# 1. Go to Edge Functions → Create new function
# 2. Name: trial-ending-notifications
# 3. Copy contents from: /supabase/functions/trial-ending-notifications/index.ts
# 4. Deploy
```

---

## Step 5: Set Up Scheduled Job for Trial Notifications

The `trial-ending-notifications` function should run daily to check for expiring trials.

### Option A: Using Supabase Cron (Native Support - Coming Soon)
Supabase will natively support cron jobs. When available:
```sql
-- Example SQL for future use
SELECT cron.schedule(
  'trial-ending-check',
  '0 9 * * *', -- Daily at 9 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/trial-ending-notifications',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### Option B: Using External Cron Service (Current Solution)
Use services like:
- **Cron-job.org** (free): https://cron-job.org
- **EasyCron** (free tier): https://easycron.com
- **GitHub Actions** (free): Set up workflow
- **Vercel Cron** (if using Vercel)

**Configuration Example (Cron-job.org):**
1. Create account at https://cron-job.org
2. Create new cron job:
   - **URL**: `https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/trial-ending-notifications`
   - **Schedule**: Daily at 9:00 AM (your timezone)
   - **HTTP Method**: POST
   - **Headers**:
     - `Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`
     - `Content-Type: application/json`
   - **Body**: `{}`

### Option C: Using GitHub Actions
Create `.github/workflows/trial-notifications.yml`:
```yaml
name: Trial Ending Notifications

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Trial Notifications
        run: |
          curl -X POST \
            'https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/trial-ending-notifications' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}' \
            -H 'Content-Type: application/json'
```

---

## Step 6: Test Email System

### 6.1 Test Welcome Email
1. Create a new organization through the signup flow
2. Check console logs in browser (if RESEND_API_KEY not set) or your email inbox
3. Verify email was logged in `email_notifications` table:
```sql
SELECT * FROM email_notifications WHERE email_type = 'welcome' ORDER BY created_at DESC LIMIT 5;
```

### 6.2 Test Subscription Emails
1. Complete a test Stripe checkout using test card (4242 4242 4242 4242)
2. Check for `subscription_activated` email
3. Verify in database:
```sql
SELECT * FROM email_notifications WHERE email_type = 'subscription_activated' ORDER BY created_at DESC LIMIT 5;
```

### 6.3 Test Payment Failed Email
1. In Stripe dashboard, simulate a failed payment
2. Check for `payment_failed` email
3. Verify in database:
```sql
SELECT * FROM email_notifications WHERE email_type = 'payment_failed' ORDER BY created_at DESC LIMIT 5;
```

### 6.4 Test Trial Ending Email
**Manual Test:**
```bash
# Call the function directly
curl -X POST \
  'https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/trial-ending-notifications' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

Or temporarily modify an organization's `trial_ends_at` to be 3 days from now:
```sql
-- Test only - adjust a trial to end in 3 days
UPDATE organizations
SET trial_ends_at = NOW() + INTERVAL '3 days'
WHERE id = 'your-test-org-id';

-- Then trigger the function manually
-- Check logs and email_notifications table
```

---

## Step 7: Monitor Email Delivery

### View Email Logs in Database
```sql
-- All emails sent today
SELECT
  email_type,
  recipient_email,
  status,
  sent_at,
  error_message
FROM email_notifications
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;

-- Email delivery statistics
SELECT
  email_type,
  status,
  COUNT(*) as count
FROM email_notifications
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY email_type, status
ORDER BY email_type, status;

-- Failed emails
SELECT *
FROM email_notifications
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;
```

### Monitor in Resend Dashboard
1. Go to https://resend.com/emails
2. View delivery status, opens, clicks (if tracking enabled)
3. Check bounce reports and spam complaints

---

## Email Types Implemented

| Email Type | Trigger | Recipient | Function |
|------------|---------|-----------|----------|
| `welcome` | Organization signup | Organization owner | Sent immediately after org creation |
| `subscription_activated` | Stripe checkout success | Organization owner | Via stripe-webhook |
| `payment_failed` | Stripe payment failure | Organization owner | Via stripe-webhook |
| `trial_ending` | Trial expires in 3 or 1 days | Organization owner | Via scheduled job |

---

## Troubleshooting

### Emails Not Sending
1. **Check Resend API Key**: Verify it's set correctly in Supabase secrets
2. **Check Domain Verification**: Ensure myaisummit.digital is verified in Resend
3. **Check Function Logs**:
   - Go to Supabase Dashboard → Edge Functions → Select function → Logs
   - Look for error messages
4. **Check Database**: Query `email_notifications` table for error messages
5. **Check Console Mode**: If RESEND_API_KEY is not set, emails are only logged to console

### Database Errors
```sql
-- Check if table exists
SELECT tablename FROM pg_tables WHERE tablename = 'email_notifications';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'email_notifications';

-- Check permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'email_notifications';
```

### Edge Function Errors
- Verify all environment variables are set
- Check function logs in Supabase dashboard
- Test function with curl to see raw response
- Ensure service role key has proper permissions

---

## Security Considerations

1. **Never commit API keys** to version control
2. **Use service role key** only in secure environments (Edge Functions, backend)
3. **RLS policies** protect email_notifications table
4. **Rate limiting**: Consider implementing in send-email function if needed
5. **Email verification**: Resend handles SPF/DKIM automatically

---

## Next Steps

1. Set up monitoring alerts for failed emails
2. Implement email templates for:
   - Invitation emails
   - Password reset (if not using Supabase auth emails)
   - Course completion notifications
3. Add email preferences to user profiles
4. Consider adding unsubscribe links for marketing emails
5. Set up bounce handling

---

## Support Resources

- **Resend Documentation**: https://resend.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Supabase Environment Variables**: https://supabase.com/docs/guides/functions/secrets

---

## Quick Reference

### Environment Variables Required
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=admin@myaisummit.digital
```

### Function URLs
```
send-email: https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/send-email
stripe-webhook: https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/stripe-webhook
trial-ending-notifications: https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/trial-ending-notifications
```

### Test Email Command
```bash
curl -X POST 'https://lmnpzfafwslxeqmdrucx.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello!</h1>",
    "emailType": "test"
  }'
```

---

**Deployment Checklist:**
- [ ] Resend account created
- [ ] Domain myaisummit.digital verified in Resend
- [ ] Resend API key obtained
- [ ] Environment variables added to Supabase
- [ ] Database migration applied
- [ ] send-email function deployed
- [ ] stripe-webhook function updated and deployed
- [ ] trial-ending-notifications function deployed
- [ ] Cron job scheduled for trial notifications
- [ ] Welcome email tested
- [ ] Subscription email tested
- [ ] Email monitoring set up

---

**Status:** Ready for production deployment
**Last Updated:** 2025-11-13
**Contact:** admin@myaisummit.digital
