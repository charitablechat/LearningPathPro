# ClearCourseStudio Multi-Tenant SaaS Platform

Complete documentation for the multi-tenant Learning Management System transformation.

## Overview

ClearCourseStudio has been transformed from a single-instance LMS into a comprehensive multi-tenant SaaS platform where each organization gets:
- Branded learning environment with custom colors
- Subscription-based access with flexible pricing tiers
- Usage limits based on subscription plan
- Complete data isolation
- Optional custom domain support

## Architecture

### Multi-Tenancy Model
- **Organization-based isolation**: Each organization has its own workspace
- **Shared database, separated data**: All organizations share the same database with Row Level Security (RLS) enforcing data isolation
- **Subdomain routing**: Each organization gets `{slug}.clearcoursestudio.com`
- **Custom domains**: Enterprise plans can use custom domains

### Database Schema

#### Core Tables

**organizations**
- Primary tenant container
- Fields: name, slug, custom_domain, logo_url, primary_color, secondary_color, owner_id, subscription_status, trial_ends_at

**subscription_plans**
- Available pricing tiers (Starter, Professional, Enterprise)
- Defines limits: max_courses, max_instructors, max_learners
- Fields: name, slug, price_monthly, price_yearly, stripe_price_ids, features (jsonb)

**subscriptions**
- Active subscriptions linking organizations to plans
- Stripe integration fields: stripe_subscription_id, stripe_customer_id
- Billing cycle management

**promo_codes**
- Promotional codes including Lifetime Deals
- Fields: code, type, discount details, max_redemptions, lifetime_plan_limits (jsonb)

**organization_invitations**
- Pending team member invitations
- Token-based acceptance flow

**organization_usage_logs**
- Tracks resource usage for analytics

#### Modified Tables
All existing tables now include `organization_id` foreign key:
- profiles
- courses
- modules
- lessons
- enrollments
- lesson_progress

## Pricing Structure

### Plans

**Starter Plan**
- $29/month or $290/year
- 5 courses
- 2 instructors
- 100 learners
- Email support
- Basic analytics

**Professional Plan**
- $99/month or $990/year
- 25 courses
- 10 instructors
- 500 learners
- Priority support
- Advanced analytics
- Custom branding

**Enterprise Plan**
- $499/month or $5,490/year
- Unlimited courses
- Unlimited instructors
- 2,000 learners
- Dedicated support
- Advanced analytics
- Custom branding
- Custom domain support
- API access

**Lifetime Deal (LTD)**
- One-time payment via promo code `LTD2025`
- Limited to 150 total redemptions
- 30 courses
- 15 instructors
- 1,000 learners
- Priority support, advanced analytics, custom branding

### Trial Period
- 14 days free trial for all new organizations
- No credit card required
- Full access to all features during trial

## Stripe Integration

### Setup Requirements

1. **Create Stripe Account**
   - Sign up at https://dashboard.stripe.com/register
   - Get API keys from https://dashboard.stripe.com/apikeys

2. **Create Products and Prices**
   ```
   Create 3 products in Stripe:
   1. ClearCourseStudio Starter
      - Monthly price: $29
      - Yearly price: $290
   2. ClearCourseStudio Professional
      - Monthly price: $99
      - Yearly price: $990
   3. ClearCourseStudio Enterprise
      - Monthly price: $499
      - Yearly price: $5,490
   ```

3. **Update Database**
   ```sql
   UPDATE subscription_plans
   SET stripe_monthly_price_id = 'price_xxx',
       stripe_yearly_price_id = 'price_xxx'
   WHERE slug = 'starter';

   -- Repeat for professional and enterprise
   ```

4. **Configure Environment Variables**
   ```bash
   # In Supabase Dashboard > Edge Functions > Secrets
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Set Up Webhooks**
   - URL: `https://[project-ref].supabase.co/functions/v1/stripe-webhook`
   - Events to listen for:
     - checkout.session.completed
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.payment_failed
     - invoice.payment_succeeded

### Webhook Edge Function

Deployed at `/functions/v1/stripe-webhook`
- Handles subscription lifecycle events
- Updates organization subscription status
- Creates/updates subscription records
- Does NOT require JWT verification (webhook signature validation instead)

### Checkout Flow

1. User selects plan on pricing page
2. Frontend calls `/functions/v1/create-checkout-session` edge function
3. Edge function creates Stripe Checkout Session
4. User redirected to Stripe-hosted checkout
5. Upon completion, webhook updates database
6. User redirected back to dashboard

## Email Service

### Swappable Architecture

The email system is designed to be provider-agnostic:

```typescript
// src/lib/email.ts
export const emailService = createEmailProvider();
```

Supports:
- **Resend** (recommended): Modern, simple API
- **SendGrid**: Established provider
- **Console**: Development/testing (logs to console)

### Configuration

```bash
# .env
VITE_EMAIL_PROVIDER=resend  # or 'sendgrid' or 'console'
VITE_EMAIL_API_KEY=your_api_key_here
VITE_EMAIL_FROM=noreply@clearcoursestudio.com
```

### Email Templates

Pre-built templates for:
- Welcome email (organization creation)
- Team invitation
- Trial ending (3 days, 1 day warnings)
- Subscription activated
- Payment failed

## Organization Context

### React Context Provider

```tsx
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';

// Wrap app with provider
<OrganizationProvider>
  <App />
</OrganizationProvider>

// Use in components
const { organization, canCreateCourse, isTrialExpired } = useOrganization();
```

### Feature Limit Checking

```typescript
import { checkFeatureLimit } from './lib/organization';

// Check before creating courses
const { allowed, current, max } = await checkFeatureLimit(orgId, 'courses');

if (!allowed) {
  showToast(`Course limit reached (${max}). Upgrade to create more.`);
  return;
}

// Proceed with course creation
```

## Super Admin Dashboard

### Access
- Available to users with `is_super_admin = true` in profiles table
- Route: `/super-admin`
- Set super admin via SQL:
  ```sql
  UPDATE profiles
  SET is_super_admin = true
  WHERE email = 'kale@lighthousechatbots.com';
  ```

### Features
- View all organizations
- Monitor subscription status
- Track platform metrics
- Search and filter organizations
- Quick access to organization portals

## Security

### Row Level Security (RLS)

All tables have RLS enabled with restrictive policies:

**Organizations**: Users can only view organizations they belong to or own
**Courses/Content**: Scoped to user's organization
**Subscriptions**: Only accessible by organization members and super admins
**Promo Codes**: Read-only for validation, write access for super admins

### Data Isolation

- Organization ID required on all tenant-scoped tables
- Foreign key constraints ensure referential integrity
- Cascade deletes maintain data consistency
- Indexes on organization_id for performance

### Super Admin Override

Super admins can:
- View all organizations
- Access all data across tenants
- Manage subscription plans
- Create/manage promo codes

## Public Marketing Site

### Routes

- `/` - Landing page
- `/pricing` - Pricing plans
- `/features` - Feature showcase (to be built)
- `/about` - About page (to be built)
- `/contact` - Contact form (to be built)
- `/terms` - Terms of Service (to be built)
- `/privacy` - Privacy Policy (to be built)

### Navigation

Public nav bar with:
- Logo and branding
- Links to pricing, features, etc.
- Sign In / Sign Up buttons

## Onboarding Flow

### New User Journey

1. **Landing Page**: User visits clearcoursestudio.com
2. **Sign Up**: Creates account with email/password
3. **Organization Setup**: Multi-step wizard
   - Step 1: Organization name and slug
   - Step 2: Brand colors
   - Step 3: Optional promo code
4. **Dashboard**: Redirected to role-appropriate dashboard
5. **Trial Period**: 14 days to explore all features
6. **Subscription**: Prompted to subscribe before trial ends

### Organization Creation

```typescript
const org = await createOrganization({
  name: 'Acme Learning',
  slug: 'acme-learning',
  owner_id: user.id,
  primary_color: '#3B82F6',
  secondary_color: '#1E40AF',
});
```

### Profile Update

```typescript
// Link user to organization
await supabase
  .from('profiles')
  .update({
    organization_id: org.id,
    role: 'admin'  // Owner becomes admin
  })
  .eq('id', user.id);
```

## Environment Variables

### Required

```bash
# Supabase (already configured)
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Stripe (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Edge Function Secrets (set in Supabase Dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=[auto-configured]
```

### Optional

```bash
# Email Service
VITE_EMAIL_PROVIDER=console  # resend, sendgrid, or console
VITE_EMAIL_API_KEY=          # if using resend or sendgrid
VITE_EMAIL_FROM=noreply@clearcoursestudio.com
```

## Deployment Checklist

### Pre-Launch

- [ ] Set up Stripe account and create products
- [ ] Configure Stripe webhooks
- [ ] Add Stripe API keys to environment
- [ ] Test full subscription flow in test mode
- [ ] Set up email service (or use console for testing)
- [ ] Create super admin user
- [ ] Test organization creation flow
- [ ] Test team invitation flow
- [ ] Test course creation with limits
- [ ] Verify RLS policies are working

### Production Launch

- [ ] Switch Stripe to live mode
- [ ] Update Stripe keys in environment
- [ ] Configure custom domain DNS (if applicable)
- [ ] Set up monitoring and error tracking
- [ ] Create backup strategy
- [ ] Prepare support documentation
- [ ] Set up customer success workflows
- [ ] Monitor initial signups closely

## API Reference

### Organization Management

```typescript
// Get organization
const org = await getOrganization(organizationId);

// Get by slug
const org = await getOrganizationBySlug('acme-learning');

// Update organization
await updateOrganization(orgId, {
  name: 'New Name',
  primary_color: '#FF0000'
});

// Check feature limits
const { allowed, current, max } = await checkFeatureLimit(orgId, 'courses');
```

### Subscription Management

```typescript
// Get subscription plans
const plans = await getSubscriptionPlans();

// Get organization subscription
const { subscription, plan } = await getOrganizationSubscription(orgId);

// Create checkout session
const sessionId = await createCheckoutSession({
  priceId: plan.stripe_monthly_price_id,
  organizationId: org.id,
  planId: plan.id,
  billingCycle: 'monthly',
  successUrl: 'https://app.clearcoursestudio.com/success',
  cancelUrl: 'https://app.clearcoursestudio.com/pricing'
});

// Redirect to checkout
await redirectToCheckout(sessionId);
```

### Promo Codes

```typescript
// Validate promo code
const promo = await validatePromoCode('LTD2025');

// Redeem promo code
await redeemPromoCode(promoId, organizationId, userId);
```

## Troubleshooting

### Common Issues

**Issue**: Users can't create courses
- Check subscription status
- Verify course limit hasn't been reached
- Ensure user has instructor or admin role

**Issue**: Webhook not working
- Verify webhook secret is correct
- Check Supabase function logs
- Test webhook with Stripe CLI

**Issue**: Promo code not working
- Check code is active
- Verify not at max redemptions
- Ensure valid date range

**Issue**: Organization not showing
- Check user profile has organization_id set
- Verify RLS policies
- Check organization exists in database

## Support & Documentation

For additional help:
- Email: kale@lighthousechatbots.com
- Platform: clearcoursestudio.com

## Version History

- **v2.0.0** (2025-01-23): Multi-tenant SaaS transformation
  - Organization-based tenancy
  - Stripe subscription billing
  - Lifetime deal promo codes
  - Public marketing site
  - Super admin dashboard
  - Feature usage limits
  - Trial period management
