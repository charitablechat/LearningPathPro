# Production Readiness Guide

This guide provides a step-by-step checklist for preparing your Clear Course Studio LMS for production deployment.

## Quick Start Checklist

- [ ] Configure environment variables
- [ ] Set up email service
- [ ] Deploy Edge Functions
- [ ] Configure Stripe live keys
- [ ] Set up storage buckets
- [ ] Create super admin account
- [ ] Update CORS origins
- [ ] Run security audit
- [ ] Test production build
- [ ] Deploy to hosting platform

---

## 1. Environment Variables Setup

### Frontend Environment Variables (.env)

Update your `.env` file with production values:

```bash
# Copy from template
cp .env.template .env

# Required Variables:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key  # MUST be pk_live_ for production
VITE_EMAIL_PROVIDER=resend  # or sendgrid
VITE_EMAIL_API_KEY=your_email_api_key
VITE_EMAIL_FROM=noreply@yourdomain.com
VITE_APP_DOMAIN=https://yourdomain.com
```

### Supabase Edge Function Secrets

Set secrets via Supabase Dashboard or CLI:

```bash
# Via Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Verify secrets are set
supabase secrets list
```

Note: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions.

---

## 2. Email Service Configuration

### Option A: Resend (Recommended)

1. Sign up at [https://resend.com](https://resend.com)
2. Verify your domain with DNS records:
   - Add TXT record for domain verification
   - Add SPF and DKIM records
3. Create API key: [https://resend.com/api-keys](https://resend.com/api-keys)
4. Update `.env`:
   ```bash
   VITE_EMAIL_PROVIDER=resend
   VITE_EMAIL_API_KEY=re_your_api_key
   VITE_EMAIL_FROM=noreply@yourdomain.com
   ```

### Option B: SendGrid

1. Sign up at [https://sendgrid.com](https://sendgrid.com)
2. Verify sender domain or email address
3. Create API key with Mail Send permission
4. Update `.env`:
   ```bash
   VITE_EMAIL_PROVIDER=sendgrid
   VITE_EMAIL_API_KEY=SG.your_api_key
   VITE_EMAIL_FROM=noreply@yourdomain.com
   ```

### Testing Email Service

```typescript
// In browser console or test file:
import { emailService, emailTemplates } from './src/lib/email';

await emailService.sendEmail({
  to: 'your-test-email@example.com',
  subject: 'Test Email',
  html: emailTemplates.welcome('Test Org', 'Test User'),
});
```

---

## 3. Stripe Configuration

### Switch to Live Mode

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle from "Test mode" to "Live mode" (top right)
3. Navigate to: Developers → API keys
4. Copy your live publishable key (starts with `pk_live_`)
5. Copy your live secret key (starts with `sk_live_`)

### Create Live Products and Prices

1. Go to: Products → Add Product
2. Create three products:
   - Starter Plan
   - Professional Plan
   - Enterprise Plan
3. For each product, create two prices (monthly and yearly)
4. Note down the price IDs (start with `price_`)

### Update Database with Live Price IDs

```sql
-- Connect to your Supabase database and run:
UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_live_monthly_id',
  stripe_price_id_yearly = 'price_live_yearly_id'
WHERE name = 'Starter';

UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_live_monthly_id',
  stripe_price_id_yearly = 'price_live_yearly_id'
WHERE name = 'Professional';

UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_live_monthly_id',
  stripe_price_id_yearly = 'price_live_yearly_id'
WHERE name = 'Enterprise';
```

### Configure Webhook Endpoint

1. Go to: Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen to:
   - [x] checkout.session.completed
   - [x] customer.subscription.updated
   - [x] customer.subscription.deleted
   - [x] invoice.payment_succeeded
   - [x] invoice.payment_failed
4. Click "Add endpoint"
5. Click "Reveal" under "Signing secret" and copy the value (starts with `whsec_`)
6. Set in Supabase secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret
   ```

---

## 4. Supabase Storage Buckets Setup

### Create Buckets via SQL

Run this in your Supabase SQL editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('organization-logos', 'organization-logos', true),
  ('course-content', 'course-content', false)
ON CONFLICT (id) DO NOTHING;

-- Set up policies for avatars bucket
CREATE POLICY "Public avatars are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Set up policies for organization-logos bucket
CREATE POLICY "Public logos are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'organization-logos');

CREATE POLICY "Org owners can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'organization-logos' AND
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id::text = (storage.foldername(name))[1]
      AND owner_id = auth.uid()
    )
  );

-- Set up policies for course-content bucket (private)
CREATE POLICY "Users can view course content in their org"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'course-content' AND
    EXISTS (
      SELECT 1 FROM courses c
      JOIN organization_members om ON om.organization_id = c.organization_id
      WHERE c.id::text = (storage.foldername(name))[1]
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can upload course content"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'course-content' AND
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id::text = (storage.foldername(name))[1]
      AND c.instructor_id = auth.uid()
    )
  );
```

---

## 5. Super Admin Setup

### Create Super Admin Account

1. Register a new account through your application UI
2. Note the user's email address
3. Run this SQL in Supabase SQL Editor:

```sql
-- Update the profile to super admin
UPDATE profiles
SET
  role = 'super_admin',
  is_super_admin = true
WHERE email = 'admin@yourdomain.com';  -- Replace with your admin email

-- Verify
SELECT id, email, role, is_super_admin
FROM profiles
WHERE email = 'admin@yourdomain.com';
```

### Super Admin Capabilities

Super admins can:
- View all organizations
- Access any organization's dashboard
- Manage platform-wide settings
- View analytics across all organizations
- Manage all users and subscriptions
- Access super admin dashboard at `/super-admin`

---

## 6. CORS Configuration

### Update Edge Functions

Edit each Edge Function and add your production domain:

```typescript
// In supabase/functions/create-checkout-session/index.ts
// In supabase/functions/stripe-webhook/index.ts

const ALLOWED_ORIGINS = [
  'http://localhost:5173',  // Development
  'http://localhost:4173',  // Preview
  'https://yourdomain.com',  // ADD YOUR DOMAIN
  'https://www.yourdomain.com',  // ADD WWW SUBDOMAIN IF USED
];
```

### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy delete-user

# Or deploy all at once
supabase functions deploy
```

---

## 7. Security Audit

### Run npm audit

```bash
npm audit

# Fix vulnerabilities automatically
npm audit fix

# For breaking changes, review manually
npm audit fix --force
```

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update to latest versions (carefully)
npm install <package>@latest
```

### Review Security Checklist

- [ ] All Stripe keys are live keys (pk_live_, sk_live_)
- [ ] Webhook signing secret is configured
- [ ] CORS origins include only your domains (no wildcard in production)
- [ ] RLS policies are enabled on all tables
- [ ] Storage bucket policies restrict access appropriately
- [ ] Rate limiting is enabled on checkout endpoint
- [ ] No sensitive data in console.log statements
- [ ] Error messages don't expose internal details
- [ ] SQL injection protection via parameterized queries
- [ ] XSS protection via React's built-in escaping

---

## 8. Build and Deploy

### Test Production Build Locally

```bash
# Create production build
npm run build

# Check for build errors
# Look for: "built in Xms"

# Preview production build
npm run preview

# Test in browser at http://localhost:4173
```

### Verify Build Optimization

Check `dist/` folder:
- [ ] `index.html` exists
- [ ] Assets have hashed filenames
- [ ] No source maps (*.map files)
- [ ] Vendor chunks are split appropriately
- [ ] Main bundle < 1MB

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel Dashboard:
# Settings → Environment Variables → Add each variable
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify Dashboard:
# Site settings → Build & deploy → Environment
```

---

## 9. Post-Deployment Testing

### Complete User Journey Test

1. **Registration Flow**
   - [ ] Create new organization
   - [ ] Receive welcome email
   - [ ] Access dashboard

2. **Subscription Flow**
   - [ ] Navigate to pricing page
   - [ ] Select a plan
   - [ ] Complete Stripe checkout
   - [ ] Verify webhook received
   - [ ] Confirm subscription activated in database
   - [ ] Receive confirmation email

3. **Course Management**
   - [ ] Create a course
   - [ ] Upload course materials
   - [ ] Publish course
   - [ ] Enroll as learner
   - [ ] View course content

4. **File Uploads**
   - [ ] Upload profile avatar
   - [ ] Upload organization logo
   - [ ] Upload course video/PDF
   - [ ] Verify files are accessible

5. **Email Notifications**
   - [ ] Invitation emails work
   - [ ] Trial ending notifications work
   - [ ] Payment failed emails work

### Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Performance Check

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] All images optimized
- [ ] No console errors

---

## 10. Monitoring Setup

### Error Monitoring (Sentry)

1. Sign up at [https://sentry.io](https://sentry.io)
2. Create new project
3. Install Sentry:
   ```bash
   npm install @sentry/react
   ```
4. Configure in `src/main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react";

   if (import.meta.env.PROD) {
     Sentry.init({
       dsn: "your-sentry-dsn",
       environment: import.meta.env.MODE,
       tracesSampleRate: 1.0,
     });
   }
   ```

### Uptime Monitoring

Options:
- [UptimeRobot](https://uptimerobot.com) (Free tier available)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

Set up monitors for:
- Homepage (https://yourdomain.com)
- API health endpoint
- Edge Functions

---

## 11. Launch Day Tasks

### Pre-Launch (1-2 hours before)

- [ ] Double-check all environment variables
- [ ] Verify Stripe is in live mode
- [ ] Test one complete checkout with real payment method
- [ ] Refund test transaction
- [ ] Clear any test data from production database
- [ ] Verify email service is working
- [ ] Check SSL certificate is valid
- [ ] Test all critical user flows

### Launch

- [ ] Deploy to production
- [ ] Monitor error logs for 30 minutes
- [ ] Test registration flow
- [ ] Test payment flow
- [ ] Verify webhooks are being received
- [ ] Send test emails
- [ ] Check database for correct data

### Post-Launch (First 24 Hours)

- [ ] Monitor error rates every 2 hours
- [ ] Check Stripe dashboard for successful payments
- [ ] Review email delivery rates
- [ ] Monitor server response times
- [ ] Check for any security alerts
- [ ] Verify backups are running

---

## 12. Maintenance Schedule

### Daily
- Check error monitoring dashboard
- Review failed payment notifications
- Monitor uptime status

### Weekly
- Review security logs
- Check for dependency updates
- Review performance metrics
- Analyze user feedback

### Monthly
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Review and optimize database queries
- Check SSL certificate expiration
- Test backup restoration

### Quarterly
- Conduct security review
- Perform load testing
- Review and optimize costs
- Update disaster recovery plan
- Full backup restoration test

---

## Troubleshooting

### Payments Not Working

1. Check Stripe dashboard for errors
2. Verify webhook secret is correct
3. Check Edge Function logs: `supabase functions logs stripe-webhook`
4. Ensure CORS allows your domain
5. Verify live keys are being used

### Emails Not Sending

1. Check email provider dashboard
2. Verify API key is correct
3. Ensure sender domain is verified
4. Check email logs in provider dashboard
5. Test with simple email first

### File Uploads Failing

1. Check storage bucket exists
2. Verify RLS policies allow upload
3. Check file size limits
4. Ensure correct bucket name in code
5. Review storage policies in Supabase

### CORS Errors

1. Add domain to ALLOWED_ORIGINS in Edge Functions
2. Redeploy Edge Functions
3. Clear browser cache
4. Check exact domain matches (http vs https, www vs non-www)

---

## Support Resources

- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Stripe Docs: [https://stripe.com/docs](https://stripe.com/docs)
- React Docs: [https://react.dev](https://react.dev)
- Vite Docs: [https://vitejs.dev](https://vitejs.dev)

---

**Last Updated**: December 2024
**Version**: 1.0.0
