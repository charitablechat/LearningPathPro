# Launch Checklist - Quick Reference

Use this checklist to ensure you've completed all necessary steps before launching to production.

## Status: Ready for Configuration

Your application has been prepared for production deployment. The codebase is production-ready, and all necessary configuration files have been created.

---

## What's Been Completed

- [x] **Deployment Configuration Files**
  - Created `vercel.json` with security headers

- [x] **Environment Variables**
  - Updated `.env.template` with all required variables
  - Added `VITE_APP_DOMAIN` for configurable domains
  - Added comprehensive documentation for each variable

- [x] **Email Templates**
  - Made all email templates use configurable domain
  - Email templates now respect `VITE_APP_DOMAIN` environment variable

- [x] **Edge Functions**
  - Updated CORS configuration with clear instructions
  - Added comments indicating where to add production domains

- [x] **Documentation**
  - Created comprehensive `PRODUCTION_READINESS_GUIDE.md`
  - Includes step-by-step instructions for all production tasks

- [x] **Build Verification**
  - Production build tested successfully
  - No TypeScript errors
  - Build size: ~400KB main bundle (optimized)

---

## Critical Tasks You Must Complete

### 1. Stripe Configuration (Required)

**Current Status**: Using test key

**Action Required**:
```bash
# In .env file, replace with your live key:
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_LIVE_KEY
```

**Steps**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to Live mode (toggle in top right)
3. Navigate to: Developers → API keys
4. Copy your Live publishable key
5. Update `.env` file
6. Create subscription products and prices
7. Update database with live price IDs (see PRODUCTION_READINESS_GUIDE.md)
8. Configure webhook endpoint for production URL
9. Set webhook secret in Supabase: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

---

### 2. Email Service Configuration (Required for Production)

**Current Status**: Using console logging (development only)

**Action Required**:
```bash
# Choose either Resend or SendGrid and update .env:
VITE_EMAIL_PROVIDER=resend  # or sendgrid
VITE_EMAIL_API_KEY=your_api_key
VITE_EMAIL_FROM=noreply@yourdomain.com
```

**Recommended**: Use Resend (https://resend.com)
- Simple setup
- Generous free tier
- Excellent deliverability

**Steps**:
1. Sign up for email service
2. Verify your domain with DNS records
3. Create API key
4. Update `.env` file
5. Test email sending

---

### 3. Production Domain Configuration (Required)

**Action Required**:
```bash
# In .env file:
VITE_APP_DOMAIN=https://yourdomain.com
```

**Also update Edge Functions**:
1. Edit `supabase/functions/create-checkout-session/index.ts`
2. Edit `supabase/functions/stripe-webhook/index.ts`
3. Add your production domain to `ALLOWED_ORIGINS` array:
   ```typescript
   const ALLOWED_ORIGINS = [
     'http://localhost:5173',
     'http://localhost:4173',
     'https://yourdomain.com',      // ADD THIS
     'https://www.yourdomain.com',  // ADD THIS IF USING WWW
   ];
   ```

---

### 4. Deploy Edge Functions (Required)

**Action Required**:
```bash
# Set Stripe secrets first
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Deploy all functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy delete-user
```

---

### 5. Set Up Storage Buckets (Required for File Uploads)

**Action Required**:
Run the SQL commands in Section 4 of `PRODUCTION_READINESS_GUIDE.md`

This creates three buckets:
- `avatars` - User profile pictures
- `organization-logos` - Organization branding
- `course-content` - Course videos, PDFs, etc.

---

### 6. Create Super Admin Account (Recommended)

**Action Required**:
1. Register an account through your application UI
2. Run this SQL in Supabase SQL Editor:
   ```sql
   UPDATE profiles
   SET role = 'super_admin', is_super_admin = true
   WHERE email = 'your-admin-email@domain.com';
   ```

---

### 7. Deploy to Hosting Platform

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```
Then set environment variables in Vercel Dashboard.

---

## Optional but Recommended

### 8. Error Monitoring

Install Sentry or similar:
```bash
npm install @sentry/react
```

### 9. Uptime Monitoring

Set up at:
- UptimeRobot (free)
- Pingdom
- StatusCake

### 10. Analytics

Consider adding:
- Google Analytics
- Plausible
- PostHog

---

## Pre-Launch Testing

Before announcing your launch:

1. **Test Complete User Journey**
   - Register new organization
   - Subscribe to a plan (use test card first)
   - Create a course
   - Upload content
   - Enroll a learner
   - Complete a lesson

2. **Test Email Notifications**
   - Welcome email
   - Invitation email
   - Payment confirmation

3. **Test on Multiple Devices**
   - Desktop (Chrome, Firefox, Safari)
   - Mobile (iOS Safari, Android Chrome)
   - Tablet

4. **Security Checks**
   - Verify test Stripe keys are NOT in production
   - Check RLS policies prevent unauthorized access
   - Test that users can't access other organizations' data
   - Verify CORS is restricted to your domain

---

## Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rates every 2 hours
- [ ] Check Stripe dashboard for payments
- [ ] Verify webhook events are being received
- [ ] Check email delivery rates
- [ ] Monitor database for any issues
- [ ] Watch for any security alerts

---

## Quick Commands Reference

```bash
# Build and test locally
npm run build
npm run preview

# Type check
npm run typecheck

# Lint
npm run lint

# Security audit
npm audit

# Deploy Edge Functions
supabase functions deploy

# Set secrets
supabase secrets set KEY=value

# View Edge Function logs
supabase functions logs function-name --tail
```

---

## Need Help?

Refer to these detailed guides:
- `PRODUCTION_READINESS_GUIDE.md` - Comprehensive setup guide
- `DEPLOYMENT_CHECKLIST.md` - Detailed deployment steps
- `PRODUCTION_SECURITY_GUIDE.md` - Security best practices
- `STRIPE_SETUP_GUIDE.md` - Stripe integration details

---

## Estimated Time to Launch

- **Minimum**: 2-3 hours (if you have Stripe account and domain ready)
- **Realistic**: 4-6 hours (including testing)
- **First-time**: 1 day (including learning curve)

---

**Ready to launch?** Start with task #1 (Stripe Configuration) and work through each section.

**Questions?** All detailed instructions are in `PRODUCTION_READINESS_GUIDE.md`

**Last Updated**: December 2024
